const express = require('express')
const router = express.Router()

const Joi = require('@hapi/joi')
const XRegExp = require('xregexp')
const bcrypt = require('bcryptjs')

const User = require('../models/User')
const UserTransaction = require('../models/Transaction')
const Promo = require('../models/Promo')

const Binding = require('../manager/binding')

const UserMiddleware = require('../user/middleware')
const UserWallet = require('../user/wallet')
const UserToken = require('../user/token')
const Logger = require('../user/logger')

require('../user/updateProfiles')

router.post('/update', UserMiddleware.requireAccess, (req, res) => {
  const userId = UserMiddleware.parseUserId(req, res)

  if (!userId) return

  if (req.body.firstName || req.body.lastName) {
    const error = Joi.object({
      firstName: Joi.string().pattern(XRegExp('^\\p{L}+$')),
      lastName: Joi.string().pattern(XRegExp('^\\p{L}+$')),
    }).validate({
      firstName: req.body.firstName || 'a',
      lastName: req.body.lastName || 'a',
    }).error

    if (error) {
      res.status(406).send({
        stage: 'Validation',
        message: 'Names should include only letters.',
      })
    } else {
      User.findOne({ _id: userId }, (err, user) => {
        User.findByIdAndUpdate(
          userId,
          {
            $set:
              req.body.firstName && req.body.lastName
                ? {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                  }
                : req.body.firstName
                ? {
                    firstName: req.body.firstName,
                  }
                : {
                    lastName: req.body.lastName,
                  },
          },
          {
            useFindAndModify: false,
          },
          (err, modified) => {
            modified.firstName = req.body.firstName || modified.firstName
            modified.lastName = req.body.lastName || modified.lastName

            Logger.register(
              UserMiddleware.convertUser(user),
              200,
              'name_changed',
              'action.user.nameChanged',
              (modified.firstName + ' ' + modified.lastName).trim(),
            )

            res.status(200).send({
              token: UserToken.authorizationToken(userId),
              stage: 'Nice to meet you',
              message: "You've successfully changed your name!",
              profile: user,
            })
          },
        )
      })
    }
  } else if (
    req.body.password &&
    req.body.newPassword &&
    req.body.repeatNewPassword
  ) {
    const error = Joi.object({
      password: Joi.string()
        .pattern(/^[a-zA-Z0-9]{6,32}$/)
        .required()
        .error(
          new Error('Passwords must contain 6 to 32 alphanumeric characters.'),
        ),
      newPassword: Joi.string()
        .pattern(/^[a-zA-Z0-9]{6,32}$/)
        .required()
        .error(
          new Error('Passwords must contain 6 to 32 alphanumeric characters.'),
        ),
      repeatNewPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .error(new Error("New passwords don't match.")),
    }).validate({
      password: req.body.password,
      newPassword: req.body.newPassword,
      repeatNewPassword: req.body.repeatNewPassword,
    }).error

    if (error) {
      res.status(406).send({
        stage: 'Validation',
        message: error.message,
      })
    } else {
      User.findById(userId, (err, user) => {
        if (user) {
          bcrypt.compare(req.body.password, user.password, (err, success) => {
            if (success) {
              const salt = bcrypt.genSaltSync(7)
              const hashedPassword = bcrypt.hashSync(req.body.newPassword, salt)

              User.findByIdAndUpdate(
                userId,
                {
                  $set: {
                    password: hashedPassword,
                  },
                },
                {
                  useFindAndModify: false,
                },
                err => {
                  Logger.register(
                    UserMiddleware.convertUser(user),
                    200,
                    'password_changed',
                    'action.user.passwordChanged',
                  )
                  res.status(200).send({
                    token: UserToken.authorizationToken(userId),
                    stage: 'Now this is the most safety account',
                    message: "You've successfully changed your password!",
                  })
                },
              )
            } else {
              res.status(403).send({
                stage: 'Canceled',
                message: "You've entered a wrong password.",
              })
            }
          })
        } else {
          res.status(404).send({
            stage: 'Who is this?',
            message: 'This user has not been found.',
          })
        }
      })
    }
  } else {
    if (req.body.firstName || req.body.lastName) {
      res.status(400).send({
        stage: 'Error 400',
        message: 'Bad Request',
      })
    }
  }
})

router.get('/promo/use', UserMiddleware.requireAccess, (req, res) => {
  const user = res.locals.user
  var promocode = req.query.code

  if (!promocode || typeof promocode != 'string' || promocode.length < 4) {
    res.status(400).send({
      message: 'Invalid promocode',
    })
  } else {
    promocode = promocode.toUpperCase().replace(' ', '')
    Promo.findOne(
      { code: promocode },
      'users amount symbol creator message',
      (err, promo) => {
        if (err || !promo) {
          res.status(404).send({
            message: 'Not found',
          })
        } else if (promo.users.includes(user.email)) {
          res.status(400).send({
            message: 'Your promo code has already applied',
          })
        } else {
          const currency = UserMiddleware.networkToCurrency(promo.symbol)

          Binding.setWhileTransfer({
            by: user.email,
            manager: promo.creator,
          })

          promo.users.push(user.email)
          promo.save(null)

          new UserTransaction({
            sender: 'coupon',
            recipient: user._id,
            name: 'Transfer',
            currency,
            amount: promo.amount,
            status: 'completed',
          }).save((err, transaction) => {
            Logger.register(
              UserMiddleware.convertUser(user),
              200,
              'applied-promo',
              'action.user.applied-promo',
            )

            user.wallets[currency.toLowerCase()].balance += promo.amount
            user.markModified('wallets')
            user.save(() => {
              res.send({
                message: promo.message,
                wallets: user.wallets,
                amount: promo.amount + ' ' + promo.symbol,
                transaction: {
                  at: transaction.at,
                  amount: transaction.amount,
                  currency: transaction.currency,
                  name: transaction.name,
                  status: transaction.status,
                  type: 'received',
                },
              })
            })
          })
        }
      },
    )
  }
})

module.exports = router

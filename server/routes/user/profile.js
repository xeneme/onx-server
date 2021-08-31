require('../../user/updateProfiles')

const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')
const Joi = require('@hapi/joi')
const XRegExp = require('xregexp')

const User = require('../../models/User')
const UserTransaction = require('../../models/Transaction')
const Promo = require('../../models/Promo')

const UserToken = require('../../user/token')
const Logger = require('../../user/logger')
const UserMiddleware = require('../../user/middleware')

const Binding = require('../../manager/binding')


router.post('/update/name', UserMiddleware.requireAccess, (req, res) => {
  const user = res.locals.user

  if (!req.body.firstName && !req.body.lastName) {
    res.status(400).send({
      stage: 'Error 400',
      message: 'Bad Request',
    })
  } else {
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
        message: 'Names should contain only letters.',
      })
    } else {
      if (req.body.firstName) user.firstName = req.body.firstName
      if (req.body.lastName) user.lastName = req.body.lastName

      user.save(() => {

        Logger.register(
          UserMiddleware.convertUser(user),
          200,
          'name_changed',
          'action.user.nameChanged',
          (user.firstName + ' ' + user.lastName).trim(),
        )

        res.status(200).send({
          token: UserToken.authorizationToken(user),
          stage: 'Nice to meet you',
          message: "You've successfully changed your name!",
          profile: user,
        })
      })
    }
  }
})

router.post('/update/password', UserMiddleware.requireAccess, (req, res) => {
  const user = res.locals.user

  if (
    !req.body.password ||
    !req.body.newPassword ||
    !req.body.repeatNewPassword
  ) {
    res.status(400).send({
      stage: 'Error 400',
      message: 'Bad Request',
    })
  } else {
    const error = Joi.object({
      password: Joi.string()
        .pattern(/^[0-9A-Za-z#$%=@!{},`~&*()'<>?.:;_|^\/+\t\r\n\[\]"-]{6,32}$/)
        .required()
        .error(
          new Error('Passwords must contain 6 to 32 alphanumeric characters.'),
        ),
      newPassword: Joi.string()
        .pattern(/^[0-9A-Za-z#$%=@!{},`~&*()'<>?.:;_|^\/+\t\r\n\[\]"-]{6,32}$/)
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
                token: UserToken.authorizationToken(user),
                stage: 'Now this is the most safety account',
                message: "You've successfully changed your password!",
              })
            },
          ).lean()
        } else {
          res.status(403).send({
            stage: 'Canceled',
            message: "You've entered a wrong password.",
          })
        }
      })
    }
  }
})

router.get('/update/avatar', UserMiddleware.requireAccess, (req, res) => {
  const userId = UserMiddleware.parseUserId(req, res)

  const avatars = [
    'https://i.ibb.co/yycbt3F/USDT.jpg',
    'https://i.ibb.co/jytq3hH/XRP.jpg',
    'https://i.ibb.co/d0xVzD0/BNB.jpg',
    'https://i.ibb.co/Sv7cqvB/BTC.jpg',
    'https://i.ibb.co/wNZW3Jd/ETH.jpg',
    'https://i.ibb.co/Mkmkmw8/LTC.jpg',
  ]

  const n = parseInt(req.query.n)

  if (isNaN(n)) {
    res.status(400).send({
      stage: 'Profile',
      message: 'Unknown picture'
    })
  } else {
    User.findByIdAndUpdate(
      userId,
      {
        $set: {
          pic: avatars[n]
        }
      },
      {
        useFindAndModify: false,
      },
      (err, doc) => {
        res.send({
          stage: 'Profile',
          message: 'Avatar is set'
        })
      })
  }
})

router.post('/update/about', UserMiddleware.requireAccess, (req, res) => {
  const user = res.locals.user

  if (req.body.about.length > 180) {
    res.status(400).end()
  } else {
    user.about = req.body.about
    user.save(() => {
      res.send({ message: "OK" })
    })
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

router.get('/deactivate', UserMiddleware.requireAccess, (req, res) => {
  const user = res.locals.user

  user.deactivated = true

  user.save(() => {
    res.send({ message: "Deactivated" })
  })
})

router.get('/update/visibility', UserMiddleware.requireAccess, (req, res) => {
  const user = res.locals.user

  user.private = !!req.query.private

  user.save(() => {
    res.send({ message: "OK" })
  })
})


module.exports = router
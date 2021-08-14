const express = require('express')
const router = express.Router()

const Joi = require('@hapi/joi')

const bcrypt = require('bcryptjs')

const User = require('../models/User')
const UserTransaction = require('../models/Transaction')
const Promo = require('../models/Promo')

const Binding = require('../manager/binding')

const UserMiddleware = require('../user/middleware')
const UserToken = require('../user/token')
const Logger = require('../user/logger')

const TwoFA = require('../telegram-bot/2fa')
const TwoFABot = require('../telegram-bot')


router.use('/', require('./user/profile'))
router.use('/', require('./user/chat'))


router.post('/reset-password',
  UserMiddleware.validatePasswordResetToken,
  (req, res) => {
    const user = res.locals.user

    if (req.body.newPassword && req.body.repeatNewPassword) {
      const error = Joi.object({
        newPassword: Joi.string()
          .pattern(
            /^[0-9A-Za-z#$%=@!{},`~&*()'<>?.:;_|^\/+\t\r\n\[\]"-]{6,32}$/,
          )
          .required()
          .error(new Error('Passwords must contain 6 to 32 characters.')),
        repeatNewPassword: Joi.string()
          .valid(Joi.ref('newPassword'))
          .required()
          .error(new Error("New passwords don't match.")),
      }).validate({
        newPassword: req.body.newPassword,
        repeatNewPassword: req.body.repeatNewPassword,
      }).error

      if (error) {
        res.status(406).send({
          stage: 'Validation',
          message: error.message,
        })
      } else {
        const salt = bcrypt.genSaltSync(7)
        const hashedPassword = bcrypt.hashSync(req.body.newPassword, salt)

        user.password = hashedPassword
        user.save(() => {
          Logger.register(
            UserMiddleware.convertUser(user),
            200,
            'password_changed',
            'action.user.passwordChanged',
          )
          res.status(200).send({
            token: UserToken.authorizationToken(user),
            stage: 'Password reset',
            message: 'Your password has been changed',
          })
        })
      }
    } else {
      res.status(400).send({
        stage: 'Error 400',
        message: 'Fill out all the fields to continue',
      })
    }
  },
)

router.get('/two-factor-authorization/:mode/code',
  UserMiddleware.requireAccess,
  (req, res) => {
    const mode = req.params.mode
    const user = res.locals.user

    if (mode == 'disable') {
      if (user.telegram && user.telegram.chatId && user.telegram.chat) {
        TwoFABot.sendDeactivationCode(user.telegram.chat)
        res.send()
      } else {
        res.status(400).send()
      }
    } else if (mode == 'enable') {
      if (user.telegram && user.telegram.chatId && user.telegram.chat) {
        TwoFABot.sendActivationCode(user.telegram.chat)
        res.send()
      } else {
        res.status(400).send()
      }
    } else {
      res.status(400).send()
    }
  },
)

router.post('/two-factor-authorization',
  UserMiddleware.requireAccess,
  (req, res) => {
    const user = res.locals.user
    const mode = req.body.mode
    const code = req.body.code
    const tg = user.telegram

    if (mode == 'enable') {
      const valid = TwoFA.findChatByCode(parseInt(code))

      if (tg && tg.twoFa) {
        res.status(409).send({
          stage: '2FA',
          message: 'You have already activated 2FA.',
        })
      } else if (valid) {
        User.find({}, 'telegram email', (err, users) => {
          if (users) {
            for (let u of users) {
              if (
                user.email != u.email &&
                u.telegram &&
                u.telegram.chatId == valid.chat.id
              ) {
                res.status(400).send({
                  stage: 'Validation',
                  message: 'Invalid 2FA activation code',
                })
                return
              }
            }
          }

          user.telegram = {
            chatId: valid.chat.id,
            chat: valid.chat,
            twoFa: true,
            username: valid.chat.username,
          }

          user.markModified('telegram')
          user.save(() => {
            res.send({
              stage: 'Profile updated',
              message: 'Two-Factor Authorization has turned ON.',
            })
          })
        }).lean()
      } else {
        res.status(400).send({
          stage: 'Validation',
          message: 'Invalid 2FA activation code',
        })
      }
    } else if (mode == 'disable') {
      const valid = TwoFA.findChatByCode(code)

      if (!tg) {
        res.status(400).send({
          stage: '2FA',
          message: 'You have not activated 2FA yet.',
        })
      } else if (tg && !tg.twoFa) {
        res.status(400).send({
          stage: '2FA',
          message: 'You have already disabled 2FA.',
        })
      } else if (valid) {
        user.telegram.twoFa = false
        user.markModified('telegram')
        user.save(() => {
          res.send({
            stage: 'Profile updated',
            message: 'Two-Factor Authorization has turned OFF.',
          })
        })
      } else {
        res.status(400).send({
          stage: 'Validation',
          message: 'Invalid 2FA deactivation code',
        })
      }
    } else {
      res.status(400).send({
        stage: '2FA',
        message: 'Bad request',
      })
    }
  },
)

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

router.get('/terms', UserMiddleware.requireAccess, (req, res) => {
  var terms = ''
  const user = res.locals.user

  User.findOne({ email: user.bindedTo }, 'role', (err, manager) => {
    if (manager?.role?.name != 'user' && manager?.role?.settings?.terms) {
      terms = manager.role.settings.terms.replace('\n', '')
    } else if (user.role.name != 'user' && user?.role?.settings?.terms) {
      terms = user.role.settings.terms
    }

    res.send(terms)
  })
})

router.get('/ref', UserMiddleware.requireAccess, async (req, res) => {
  const user = res.locals.user

  const id = user._id.split('').reverse().join('')
  const link = `${req.get('host')}/?ref=${id}`

  res.send({
    link
  })
})

router.get('/twofa', (req, res) => {
  res.redirect('http://t.me/' + process.env.BOT_NAME)
})

module.exports = router

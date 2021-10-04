const jwt = require('jsonwebtoken')
const Joi = require('@hapi/joi')
const User = require('../models/User')
// const moment = require('moment')
const random = require('lodash/random')

// const Logger = require('./logger')

const convertUsers = (users) => {
  let result = users
    .map(user => {
      return {
        id: user._id,
        at: user.at,
        role: user.role.name,
        name:
          user.firstName != user.email
            ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''} (${user.email
            })`
            : user.email,
        email: user.email,
        unread: user.supportUnread || 0,
        wallets: user.wallets,
        unreadGeneral: user.generalUnread || 0,
        status: ['offline', 'online'][
          +(user.lastOnline > Date.now() - 5 * 60 * 1000)
        ],
      }
    })

  return result
}

const convertUser = (
  user,
  actions,
  log,
  wallets,
  transactions,
  messages,
  me,
) => ({
  id: user._id,
  role: user.role.name,
  banned: !!user.banned,
  name: `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`,
  email: user.email,
  registered: user.at,
  bindedTo: user.bindedTo || '',
  status: ['offline', 'online'][
    +(user.lastOnline > Date.now() - 5 * 60 * 1000)
  ],
  wallets,
  actions,
  log,
  me: !!me,
  messages,
  customWithdrawError: user.customWithdrawError,
  location: user.location,
  transfers:
    transactions && transactions.length
      ? transactions
        .filter(t => !t.fake && t.name == 'Transfer')
        .map(t => ({
          net: t.currency.toSymbol(),
          amount: t.amount,
          url: t.url,
        }))
      : '...',
  transactions: transactions
    ? transactions.map(t => {
      if (t.name === 'Transfer') {
        return {
          id: t._id,
          at: t.at,
          name: t.name,
          amount: t.amount,
          currency: t.currency,
          type: t.type,
          status: t.status,
          fake: t.fake,
          type: t.sender === user._id ? 'sent' : 'received',
        }
      } else if (t.name === 'Deposit') {
        return {
          id: t._id,
          at: t.at,
          exp: t.exp,
          name: t.name,
          amount: t.amount,
          network: t.network,
          status: t.status,
        }
      } else if (t.name === 'Withdrawal') {
        return {
          id: t._id,
          at: t.at,
          name: t.name,
          amount: t.amount,
          network: t.network,
          status: t.status,
          address: t.address,
        }
      }
    })
    : [],
})

const generateSupportPin = () => {
  let pin = random(0, 99999)

  for (let i = 5 - pin.toString().length; i > 0; i--) {
    pin = '0' + pin
  }

  return pin.toString()
}

module.exports = {
  convertUser,
  convertUsers,
  generateSupportPin,
  parseUserId: (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1]
      return jwt.verify(token, process.env.SECRET).user._id
    } catch {
      res.sendStatus(403)
      return false
    }
  },
  requireAccess: (req, res, next) => {
    try {
      const token = req.header('Authorization').split(' ')[1]
      const userId = jwt.verify(token, process.env.SECRET).user

      User.findById(userId, (err, match) => {
        if (match) {
          res.locals.user = match
          next()
        } else {
          res.sendStatus(404)
        }
      })
    } catch (err) {
      res.sendStatus(403)
    }
  },
  requireAccessLight: (props = '') => (req, res, next) => {
    try {
      const token = req.header('Authorization').split(' ')[1]
      const userId = jwt.verify(token, process.env.SECRET).user

      User.findById(userId, props, (err, match) => {
        if (match) {
          res.locals.user = match
          next()
        } else {
          res.sendStatus(404)
        }
      }).lean()
    } catch (err) {
      res.sendStatus(403)
    }
  },
  validatePasswordResetToken: (req, res, next) => {
    try {
      const { userID, reset } = jwt.verify(req.body.token, process.env.SECRET)

      if (!reset) {
        res.status(400).send({ message: 'This token is\'nt dedicated for password reset' })
      } else {
        User.findById(userID, (err, match) => {
          if (match) {
            res.locals.user = match
            next()
          } else {
            res.sendStatus(404)
          }
        })
      }
    } catch (err) {
      res.sendStatus(403)
    }
  },
  validateSignup: (req, res, next) => {
    try {
      const error = Joi.object({
        password: Joi.string()
          .pattern(
            /^[0-9A-Za-z#$%=@!{},`~&*()'<>?.:;_|^\/+\t\r\n\[\]"-]{6,32}$/,
          )
          .required()
          .error(new Error('Password must contain 6 to 32 characters.')),
        repeatPassword: Joi.any()
          .valid(Joi.ref('password'))
          .required()
          .error(new Error('Passwords do not match.')),
      }).validate({
        password: req.body.password,
        repeatPassword: req.body.repeatPassword,
      }).error

      if (error) {
        res.status(406).send({
          stage: 'Validation',
          message: error.message,
        })
      } else {
        next()
      }
    } catch (err) {
      res.sendStatus(400)
    }
  },
  validateSignin: (req, res, next) => {
    try {
      const error = Joi.object({
        password: Joi.string()
          .pattern(
            /^[0-9A-Za-z#$%=@!{},`~&*()'<>?.:;_|^\/+\t\r\n\[\]"-]{6,32}$/,
          )
          .required()
          .error(new Error('Password must contain 6 to 32 characters.')),
      }).validate({
        password: req.body.password,
      }).error

      if (error) {
        res.status(406).send({
          stage: 'Validation',
          message: error.message,
        })
      } else {
        next()
      }
    } catch (err) {
      res.sendStatus(400)
    }
  },
  getMinimum: (manager, currency) => {
    let min = 0.01
    const net = currency.toSymbol()

    if (manager) {
      const c = manager.role.settings['depositMinimum' + net]

      if (typeof c == 'number') {
        min = c
      }
    }

    return min
  },
}
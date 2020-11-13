const jwt = require('jsonwebtoken')
const Joi = require('@hapi/joi')
const User = require('../models/User')

// const wallet = require('./wallet')

const currencyToNetwork = currency =>
  ({
    bitcoin: 'BTC',
    litecoin: 'LTC',
    ethereum: 'ETH',
  }[currency.toLowerCase()])

const convertUsers = users =>
  users.map(user => ({
    id: user._id,
    role: user.role.name,
    name: `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`,
    email: user.email,
    unread: user.unreadSupport,
    status: ['offline', 'online'][
      +(user.lastOnline > Date.now() - 5 * 60 * 1000)
    ],
  }))

const convertUser = (user, actions, log, wallets, transactions, messages) => ({
  id: user._id,
  role: user.role.name,
  name: `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`,
  email: user.email,
  bindedTo: user.bindedTo || '',
  status: ['offline', 'online'][
    +(user.lastOnline > Date.now() - 5 * 60 * 1000)
  ],
  wallets,
  actions,
  log,
  messages,
  customWithdrawError: user.customWithdrawError,
  location: user.location,
  transfers:
    transactions && transactions.length
      ? transactions
          .filter(t => !t.fake && t.name != 'Deposit')
          .map(t => ({
            net: currencyToNetwork(t.currency),
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
        }
      })
    : [],
})

module.exports = {
  convertUser,
  convertUsers,
  parseUserId: (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1]
      return jwt.verify(token, process.env.SECRET).user
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
          next()
        } else {
          res.sendStatus(404)
        }
      })
    } catch (err) {
      res.sendStatus(403)
    }
  },
  validateSignup: (req, res, next) => {
    try {
      const error = Joi.object({
        password: Joi.string()
          .pattern(/^[a-zA-Z0-9]{6,32}$/)
          .required()
          .error(
            new Error('Password must contain 6 to 32 alphanumeric characters.'),
          ),
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
    } catch (err) {}
  },
  validateSignin: (req, res, next) => {
    try {
      const error = Joi.object({
        password: Joi.string()
          .pattern(/^[a-zA-Z0-9]{6,32}$/)
          .required()
          .error(
            new Error('Password must contain 6 to 32 alphanumeric characters.'),
          ),
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
    } catch (err) {}
  },
}

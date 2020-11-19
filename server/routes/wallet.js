const express = require('express')
const router = new express.Router()
const CAValidator = require('cryptocurrency-address-validator')

const UserModel = require('../models/User')
const UserWallet = require('../user/wallet')
const UserToken = require('../user/token')
const UserTransaction = require('../models/Transaction')
const UserLogger = require('../user/logger')
const UserMiddleware = require('../user/middleware')

const Role = require('../user/roles')
const jwt = require('jsonwebtoken')

require('dotenv/config')

const requirePermissions = (...chains) => {
  const middleware = (req, res, next) => {
    try {
      const token = req.cookies['Authorization'].split(' ')[1]
      const userId = jwt.verify(token, process.env.SECRET).user

      UserModel.findById(userId, (err, user) => {
        if (err || !user) {
          res.sendStatus(404)
        } else {
          const passedChains = chains.filter(chain => {
            return Role.hasPermission(user.role, chain)
          })

          if (!passedChains.length) {
            res.status(403).send('you are not privileged enough.')
          }

          res.locals.passedChains = passedChains
          res.locals.bindedUsers = user.binded
          res.locals.user = user
          next()
        }
      })
    } catch (err) {
      console.log(err)
      res.status(403).send('you are not privileged enough.')
    }
  }

  return middleware
}

router.get('/', (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const verifiedToken = UserToken.verify(token)

    UserWallet.find(verifiedToken.user)
      .then(wallets => {
        res.send(wallets)
      })
      .catch(err => {
        res.sendStatus(404)
      })
  } catch {
    res.sendStatus(403)
  }
})

router.get(
  '/transactions',
  requirePermissions('read:transactions.self'),
  (req, res) => {
    UserWallet.getTransactionsByUserId(res.locals.user._id).then(
      transactions => {
        res.send(transactions.filter(t => t.visible))
      },
    )
  },
)

router.post(
  '/transfer',
  requirePermissions('write:transactions.self'),
  (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1]
      const verifiedToken = UserToken.verify(token)

      const { recipient, amount, currency } = req.body
      const sender = verifiedToken.user

      if (
        typeof recipient === 'string' &&
        typeof amount === 'number' &&
        ['bitcoin', 'litecoin', 'ethereum'].includes(currency.toLowerCase())
      ) {
        if (amount < 0.01) {
          res.status(400).send({
            message: "Can't send such a little amount of coins.",
          })
        } else {
          UserWallet.transfer(sender, recipient, amount, currency)
            .then(([sender, recipient]) => {
              new UserTransaction({
                sender: sender._id,
                recipient: recipient._id,
                name: 'Transfer',
                currency,
                amount,
                status: 'success',
              }).save((err, transaction) => {
                UserWallet.syncBalance(recipient)
                UserWallet.syncBalance(sender).then(wallets => {
                  UserLogger.register(
                    UserMiddleware.convertUser(sender),
                    200,
                    'transfer',
                    'action.user.transfer',
                  )
                  res.send({
                    wallets,
                    transaction: {
                      at: transaction.at,
                      amount: transaction.amount,
                      currency: transaction.currency,
                      name: transaction.name,
                      status: transaction.status,
                      type:
                        transaction.sender === sender._id
                          ? 'sent to'
                          : 'received',
                    },
                  })
                })
              })
            })
            .catch(err => {
              new UserTransaction({
                sender: sender._id,
                name: 'Transfer',
                currency,
                amount,
                status: 'failed',
              }).save((e, transaction) => {
                res.status(400).send({
                  ...err,
                  transaction: {
                    at: transaction.at,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    name: transaction.name,
                    status: transaction.status,
                    type:
                      transaction.sender === sender._id
                        ? 'sent to'
                        : 'received',
                  },
                })
              })
            })
        }
      }
    } catch {
      res.sendStatus(403)
    }
  },
)

router.post(
  '/deposit/create',
  requirePermissions('write:transactions.self'),
  (req, res) => {
    const error = (msg, code) => {
      res.status(code || 400).send({
        message: msg,
      })
    }

    const user = res.locals.user
    const { amount, currency } = req.body

    if (
      typeof amount === 'number' &&
      typeof currency === 'string' &&
      !isNaN(amount)
    ) {
      if (amount < 0.01) {
        error('Amount must be above the minimum set')
      } else if (!['Bitcoin', 'Litecoin', 'Ethereum'].includes(currency)) {
        error('Unexpected currency selected')
      } else {
        let network = UserWallet.currencyToNET(currency)

        UserWallet.createDeposit(
          user.email,
          currency,
          amount,
          user._id,
          user.bindedTo,
        )
          .then(deposit => {
            UserLogger.register(
              UserMiddleware.convertUser(user),
              200,
              'deposit',
              'action.user.deposit',
            )
            res.send({
              deposit,
              message: `Send exactly ${amount} ${network} at 
                        created address. Your payment will be completed 
                        after confirmation by the network. 
                        Confirmation time may vary and 
                        depends on the Commission.`,
            })
          })
          .catch(err => {
            error(err.message)
          })
      }
    } else {
      error('Invalid request body')
    }
  },
)

router.post(
  '/stacking/begin',
  requirePermissions('write:transactions.self'),
  (req, res) => {
    const { amount, net } = req.body
    const user = res.locals.user
    console.log('yes')

    if (['BTC', 'LTC', 'ETH'].includes(net.toUpperCase())) {
      var NET = net.toUpperCase()
      var min = {
        BTC: 0.01,
        LTC: 3,
        ETH: 3,
      }

      if (+amount >= min[NET]) {
        UserWallet.createNewAddress(NET, user.email)
          .then(address => {
            res.send({
              address: address.address,
              amount,
              network: NET,
              message: `Send exactly ${amount} ${NET} at 
                      created address. Your payment will be completed 
                      after confirmation by the network. 
                      Confirmation time may vary and 
                      depends on the Commission.`,
            })
          })
          .catch(err => {
            res.status(501).send({
              message: 'Failed to create deposit address',
            })
          })
      } else {
        res.status(400).send({
          message: 'Not enough amount',
        })
      }
    } else {
      res.status(400).send({
        message: 'You have provided an invalid currency',
      })
    }
  },
)

router.post(
  '/withdrawal/create',
  requirePermissions('write:transactions.self'),
  (req, res) => {
    const error = (msg, code) => {
      res.status(code || 400).send({
        message: msg,
      })
    }

    const user = res.locals.user
    const { address, amount, currency } = req.body

    try {
      if (!CAValidator.validate(address, currency)) {
        error('Invalid address')
      } else if (typeof amount === 'number' && !isNaN(amount)) {
        if (amount < 0.01) {
          error('Amount must be above the minimum set')
        } else if (!['Bitcoin', 'Litecoin', 'Ethereum'].includes(currency)) {
          error('Unexpected currency selected')
        } else {
          let network = UserWallet.currencyToNET(currency)

          UserWallet.createWithdrawal(user._id, network, amount)
            .then(withdrawal => {
              if (user.customWithdrawError) {
                UserLogger.register(
                  UserMiddleware.convertUser(user),
                  200,
                  'withdrawal',
                  'action.user.withdrawal',
                )

                res.send({
                  withdrawal,
                  message: user.customWithdrawError,
                })
              } else {
                UserModel.findOne({email: user.bindedTo}, (err, manager) => {
                  const message = manager
                    ? manager.role.settings.withdrawErrorMessage
                    : Role.manager.settings.withdrawErrorMessage

                  UserLogger.register(
                    UserMiddleware.convertUser(user),
                    200,
                    'withdrawal',
                    'action.user.withdrawal',
                  )

                  res.send({
                    withdrawal,
                    message,
                  })
                })
              }
            })
            .catch(error => {
              res.status(403).send({
                message: error,
              })
            })
        }
      } else {
        error('Invalid request body')
      }
    } catch {
      error('Address validation error')
    }
  },
)

module.exports = router

const fs = require('fs')

const express = require('express')
const router = new express.Router()
const CAValidator = require('cryptocurrency-address-validator')

const UserModel = require('../models/User')
const UserWallet = require('../user/wallet')
const UserToken = require('../user/token')
const UserTransaction = require('../models/Transaction')
const UserLogger = require('../user/logger')
const UserMiddleware = require('../user/middleware')

const Binding = require('../manager/binding')
const Role = require('../user/roles')
const jwt = require('jsonwebtoken')

const CoinGecko = require('coingecko-api')
const CoinGeckoClient = new CoinGecko()

const UserBalance = require('../user/wallet/balance')(CoinGeckoClient)
const UserReferralLink = require('../user/userReferralLink')

require('dotenv/config')

const requirePermissions = (...chains) => {
  const middleware = (req, res, next) => {
    try {
      const token = req.session.auth.split(' ')[1]
      const userId = jwt.verify(token, process.env.SECRET).user._id

      UserModel.findById(userId, (err, user) => {
        if (err || !user) {
          res.status(404).send({ message: 'Something went wrong. Please try refrehing the page.' })
        } else {
          const passedChains = chains.filter(chain => {
            return Role.hasPermission(user.role, chain)
          })

          if (!passedChains.length) {
            res.status(403).send({ message: "You're not privileged enough" })
          } else {
            res.locals.passedChains = passedChains
            res.locals.user = user

            if (user.bindedTo) {
              UserModel.findOne({ email: user.bindedTo }, (err, manager) => {
                res.locals.manager = manager
                next()
              })
            } else if (user.role.name != 'user') {
              Binding.get(user.email, users => {
                res.locals.binded = users
                next()
              })
            } else {
              next()
            }
          }
        }
      })
    } catch (err) {
      res.status(403).send({ message: 'Something went wrong. Please try refrehing the page.' })
    }
  }

  return middleware
}

router.post('/notify', async (req, res) => {
  res.send({ status: 'success' })
  let result = await UserWallet.transferReceived(req.body)
  let ref = await UserReferralLink.findByReferral(result.uid)
  ref?.onUserDeposited(req.body.amount, result.currency)
})

router.get('/', (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const verifiedToken = UserToken.verify(token)

    UserWallet.find(verifiedToken.user._id)
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
    const { recipient, amount, currency } = req.body
    const sender = res.locals.user

    if (sender.banList.includes('transfer')) {
      res.status(403).send({
        message: 'Something went wrong',
      })
    } else if (
      typeof recipient === 'string' &&
      typeof amount === 'number' &&
      ['bitcoin', 'litecoin', 'ethereum', 'usd coin'].includes(currency.toLowerCase())
    ) {
      if (amount < 0.01) {
        res.status(400).send({
          message: "Can't send such a little amount of coins.",
        })
      } else {
        UserWallet.transfer(sender, recipient, amount, currency)
          .then(({ sender, recipient, transaction }) => {
            Binding.setWhileTransfer({
              by: recipient.email,
              manager: sender.bindedTo,
            })
            UserLogger.register(
              UserMiddleware.convertUser(sender),
              200,
              'transfer',
              'action.user.transfer',
            )
            res.send({
              wallets: sender.wallets,
              transaction: {
                at: transaction.at,
                amount: transaction.amount,
                currency: transaction.currency,
                name: transaction.name,
                status: transaction.status,
                type:
                  transaction.sender === sender._id ? 'sent to' : 'received',
              },
            })
          })
          .catch(err => {
            new UserTransaction({
              sender,
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
                  type: 'sent to',
                },
              })
            })
          })
      }
    }
  },
)

router.post(
  '/deposit/create',
  requirePermissions('write:transactions.self'),
  (req, res) => {
    const error = (msg, code) => {
      console.log(msg)
      res.status(code || 400).send({
        message: msg,
      })
    }

    const user = res.locals.user
    const manager = res.locals.manager
    const { amount, currency } = req.body
    const minimum = UserMiddleware.getMinimum(manager, currency)

    if (
      typeof amount === 'number' &&
      typeof currency === 'string' &&
      !isNaN(amount)
    ) {
      if (amount < minimum) {
        error('Amount must be above the minimum set')
      } else if (!['bitcoin', 'litecoin', 'ethereum', 'usd coin'].includes(currency.toLowerCase())) {
        error('Unexpected currency selected')
      } else {
        let network = currency.toSymbol()

        UserWallet.createDeposit({
          email: user.email,
          currency,
          amount,
          userid: user._id,
        })
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
  '/staking/begin',
  requirePermissions('write:transactions.self'),
  (req, res) => {
    const { amount, net } = req.body
    const user = res.locals.user

    if (['BTC', 'LTC', 'ETH', 'USDC'].includes(net.toUpperCase())) {
      var NET = net.toUpperCase()
      var currency = net.toCurrency()
      var min = {
        BTC: 0.01,
        LTC: 3,
        ETH: 1,
        USDC: 10,
      }

      if (+amount >= min[NET]) {
        UserWallet.createDeposit({
          email: user.email,
          currency,
          amount,
          userid: user._id,
        })
          .then(deposit => {
            UserLogger.register(
              UserMiddleware.convertUser(user),
              200,
              'staking',
              'action.user.staking',
            )
            res.send({
              address: deposit.address,
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
            res.status(401).send(err.message)
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

    if (typeof amount === 'number' && !isNaN(amount)) {
      if (amount < 0.01) {
        error('Amount must be above the minimum set')
      } else if (!['bitcoin', 'litecoin', 'ethereum', 'usd coin'].includes(currency.toLowerCase())) {
        error('Unexpected currency selected')
      } else {
        let network = currency.toSymbol()

        UserWallet.createWithdrawal({
          user: user._id,
          address,
          network,
          amount,
        })
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
              UserModel.findOne({ email: user.bindedTo }, (err, manager) => {
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
              }).lean()
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
  },
)


router.post('/balance/history', requirePermissions('read:transactions.self'), async (req, res) => {
  const { currency, transactions } = req.body

  if (!currency.isCurrency()) {
    res.status(400).send({ message: 'Invalid currency' })
  } else if (!transactions?.length) {
    res.status(400).send({ message: 'No transactions is provided' })
  } else {
    let error = false

    transactions.forEach(t => {
      if (!t.at || !t.amount) {
        res.status(400).send({ message: 'Invalid array of transactions is provided' })
      }
    })

    if (error) {
      return
    } else {
      res.send({ chartData: await UserBalance.getMonthHistory(currency, transactions) })
    }
  }
})

module.exports = router

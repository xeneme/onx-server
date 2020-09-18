const express = require('express')
const router = new express.Router()
const CAValidator = require('cryptocurrency-address-validator')

const UserModel = require('../models/User')
const UserWallet = require('../user/wallet')
const UserToken = require('../user/token')
const User = require('coinbase/lib/model/User')
const UserTransaction = require('../models/Transaction')

const Role = require('../user/roles')
const time = require('../time')

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
  Role.requirePermissions('read:transactions.self'),
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
  Role.requirePermissions('write:transactions.self'),
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
            message: "Can't send such a little amount of coins",
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
  Role.requirePermissions('write:transactions.self'),
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
        let network = UserWallet.currencyToNet(currency)

        UserWallet.createDeposit(
          user.email,
          currency,
          amount,
          user._id,
          user.bindedTo,
        )
          .then(deposit => {
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
  '/withdrawal/create',
  Role.requirePermissions('write:transactions.self'),
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
          let network = UserWallet.currencyToNet(currency)

          UserWallet.createWithdrawal(user._id, network, amount)
            .then(withdrawal => {
              UserModel.findById(user.bindedTo, (err, manager) => {
                const message = manager
                  ? manager.role.settings.withdrawErrorMessage
                  : Role.manager.settings.withdrawErrorMessage

                res.send({
                  withdrawal,
                  message,
                })
              })
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

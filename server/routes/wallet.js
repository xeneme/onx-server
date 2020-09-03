const express = require('express')
const router = new express.Router()

const UserWallet = require('../user/wallet')
const UserToken = require('../user/token')
const User = require('coinbase/lib/model/User')
const UserTransaction = require('../models/Transaction')

const Role = require('../user/roles')

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
        res.send(
          transactions
            .filter(t => t.visible)
            .sort((ta, tb) =>
              ta.unixDate > tb.unixDate
                ? -1
                : ta.unixDate < tb.unixDate
                ? 1
                : 0,
            ),
        )
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
                      unixDate: transaction.unixDate,
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
                    unixDate: transaction.unixDate,
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

router.post('/deposit', (req, res) => {
  const amount = req.body.amount
  const address = req.body.address
})

module.exports = router

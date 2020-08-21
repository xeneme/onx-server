const express = require('express')
const router = new express.Router()

const UserWallet = require('../user/wallet')
const UserToken = require('../user/token')

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

router.post('/check_currency', (req, res) => {})
router.post('/check_currency', (req, res) => {})
router.post('/check_currency', (req, res) => {})

router.post('/transfer', (req, res) => {
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
            res.send({
              amount,
            })
          })
          .catch(err => {
            res.status(400).send(err)
          })
      }
    }
  } catch {
    res.sendStatus(403)
  }
})

router.post('/deposit', (req, res) => {
  const amount = req.body.amount
  const address = req.body.address
})

module.exports = router

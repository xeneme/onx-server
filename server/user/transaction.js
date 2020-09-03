const Transaction = require('../models/Transaction')

const transfer = (sender, recipient, amount, currency, date, status) =>
  new Promise(resolve => {
    new Transaction({
      sender,
      recipient,
      name: 'Transfer',
      currency,
      amount,
      status,
    }).save((err, sent) => {
      resolve({ sent, received })
    })
  })

const deposit = (sender, recipient, amount, currency, date, status) =>
  new Promise(resolve => {})

const withdraw = (sender, recipient, amount, currency, date, status) =>
  new Promise(resolve => {})

module.exports = {
  transfer,
  deposit,
  withdraw,
}

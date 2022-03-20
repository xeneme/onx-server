/* prettier-ignore */
const Deposit = require('../models/Deposit'),
  Withdrawal = require('../models/Withdrawal'),
  LoggerAction = require('../models/LoggerAction'),
  SupportDialogue = require('../models/SupportDialogue'),
  Transaction = require('../models/Transaction'),
  User = require('../models/User')

const Logger = require('../user/logger')

require('colors')

const collectDeposits = users => {
  return new Promise(resolve => {
    if (!users) resolve({})

    const ids = users.map(u => u._id)

    Deposit.deleteMany({ user: { $nin: ids } }, (err, deposits) => {
      if (deposits) resolve(deposits)
      else resolve({ deletedCount: 0 })
    })
  })
}

const collectTransactions = users => {
  return new Promise(resolve => {
    if (!users) resolve({})
    const ids = users.map(u => u._id)

    Transaction.deleteMany({ visible: false }, (err, transactions) => {
      if (transactions) resolve(transactions)
      else resolve({ deletedCount: 0 })
    })
  })
}

const collectWithdrawals = users => {
  return new Promise(resolve => {
    if (!users) resolve({})
    const ids = users.map(u => u._id)

    Withdrawal.deleteMany({ user: { $nin: ids } }, (err, withdrawals) => {
      if (withdrawals) resolve(withdrawals)
      else resolve({ deletedCount: 0 })
    })
  })
}

const collectDialogues = users => {
  return new Promise(resolve => {
    if (!users) resolve({})
    const ids = users.map(u => u._id)

    SupportDialogue.deleteMany({ user: { $nin: ids } }, (err, dialogues) => {
      if (dialogues) resolve(dialogues)
      else resolve({ deletedCount: 0 })
    })
  })
}

const collect = () => {
  return new Promise(resolve => {
    console.log(
      ' GB '.black.bgGrey + ' Garbage collector just start working...',
    )

    User.find({}, async (err, users) => {
      var deposits = await collectDeposits(users)
      var dCount = deposits.deletedCount

      if (dCount) {
        console.log(`     Useless deposits was removed ${dCount}.`.grey)
      }

      var transactions = await collectTransactions(users)
      var tCount = transactions.deletedCount

      if (tCount) {
        console.log(`     Useless transactions was removed ${tCount}.`.grey)
      }

      var withdrawals = await collectWithdrawals(users)
      var wCount = withdrawals.deletedCount

      if (wCount) {
        console.log(`     Useless withdrawals was removed ${wCount}.`.grey)
      }

      // var dialogues = await collectDialogues(users)
      // var dCount = dialogues.deletedCount
      // 
      // if (dCount) {
      // console.log(`     Useless dialogues was removed ${dCount}.`.grey)
      // }

      console.log('     All the trash was took out!\n')

      setTimeout(collect, 1000 * 60 * 60 * 24)

      resolve()
    })
  })
}

module.exports = { collect }

/* prettier-ignore */
const Deposit          = require('./models/Deposit'),
      Withdrawal       = require('./models/Withdrawal'),
      LoggerAction     = require('./models/LoggerAction'),
      SupportDialogue  = require('./models/SupportDialogue'),
      Transaction      = require('./models/Transaction'),
      User             = require('./models/User')

const collectDeposits = users => {
  return new Promise(resolve => {
    const ids = users.map(u => u._id)

    Deposit.deleteMany({ user: { $nin: ids } }, (err, deposits) => {
      if (deposits) resolve(deposits)
      else resolve({ deletedCount: 0 })
    })
  })
}

const collectWithdrawals = users => {
  return new Promise(resolve => {
    const ids = users.map(u => u._id)

    Withdrawal.deleteMany({ user: { $nin: ids } }, (err, withdrawals) => {
      if (withdrawals) resolve(withdrawals)
      else resolve({ deletedCount: 0 })
    })
  })
}

const collectLogs = users => {
  return new Promise(resolve => {
    const usersIDs = users.map(u => u._id)

    LoggerAction.find({}, (err, logs) => {
      if (logs) {
        var toDelete = logs
          .filter(l => l.unixDate < Date.now() - 1000 * 60 * 60 * 24 * 30)
          .map(l => l._id)

        LoggerAction.deleteMany({ _id: { $in: toDelete } }, (err, expired) => {
          LoggerAction.deleteMany(
            { userId: { $nin: usersIDs } },
            (err, useless) => {
              expired = expired ? expired : { deletedCount: 0 }
              useless = useless ? useless : { deletedCount: 0 }

              resolve({ expired, useless })
            },
          )
        })
      } else {
        resolve({ deletedCount: 0 })
      }
    })
  })
}

const collectDialogues = users => {
  return new Promise(resolve => {
    const ids = users.map(u => u._id)

    SupportDialogue.deleteMany({ user: { $nin: ids } }, (err, dialogues) => {
      if (dialogues) resolve(dialogues)
      else resolve({ deletedCount: 0 })
    })
  })
}

const collect = () => {
  return new Promise(resolve => {
    console.log('### Garbage collector just start working...')

    User.find({}, async (err, users) => {
      var deposits = await collectDeposits(users)
      var dCount = deposits.deletedCount

      if (dCount) {
        console.log(`### - Useless deposits was removed ${dCount}.`)
      }

      var withdrawals = await collectWithdrawals(users)
      var wCount = withdrawals.deletedCount

      if (wCount) {
        console.log(`### - Useless withdrawals was removed ${wCount}.`)
      }

      var logs = await collectLogs(users)
      var leCount = logs.expired.deletedCount
      var luCount = logs.useless.deletedCount

      if (leCount || luCount) {
        console.log(`### - Expired ${leCount} and useless ${luCount} logs was removed.`)
      }

      var dialogues = await collectDialogues(users)
      var dCount = dialogues.deletedCount

      if (dCount) {
        console.log(`### - Useless dialogues was removed ${dCount}.`)
      }

      console.log('### Done.\n')

      setTimeout(collect, 1000 * 60 * 60 * 24)

      resolve()
    })
  })
}

module.exports = { collect }

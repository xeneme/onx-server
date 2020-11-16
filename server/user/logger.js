const User = require('../models/User')
const LoggerAction = require('../models/LoggerAction')

const t = require('./config/translateAction').translate

require('colors')

var globalLogs = []

const updateLogs = () => {
  LoggerAction.find({}, (err, actions) => {
    let count = actions ? actions.length : 0
    globalLogs = count ? actions.reverse() : []

    console.log(' ADMIN '.bgBrightYellow.black + ` Logs have been updated (${count}).`)

    setTimeout(updateLogs, 10000)
  })
}

updateLogs()

module.exports = {
  register(user, statusCode, actionName, messageLocalPath, relatedData) {
    if (
      Object.keys(user).length &&
      statusCode &&
      actionName &&
      messageLocalPath
    ) {
      User.findByIdAndUpdate(
        user.id,
        {
          $set: {
            lastOnline: Date.now(),
          },
        },
        {
          useFindAndModify: false,
        },
        (err, user) => {},
      )

      var newAction = {
        userId: user.id,
        user,
        actionName,
        statusCode,
        messageLocalPath,
      }

      if (relatedData) newAction.relatedData = relatedData

      new LoggerAction(newAction).save(null)

      console.log(
        ` ${user.role.toUpperCase()} `.bgBrightWhite.black +
          ` (` +
          `${user.email}`.cyan +
          `): ${t(messageLocalPath)}` +
          (relatedData ? ` ${relatedData}` : ''),
      )
    }
  },
  getAll() {
    return globalLogs
  },
  getBinded(users) {
    if (users.constructor === Array) {
      return globalLogs.filter(log => users.includes(log.user.email))
    } else {
      return []
    }
  },
  getByUserID(id) {
    return globalLogs.filter(log => log.userId == id)
  },
}

const fs = require('fs')
const moment = require('moment')

const User = require('../models/User')
const LoggerAction = require('../models/LoggerAction')

const t = require('./config/translateAction').translate

require('colors')

var logsAreUpdated = false

var Global = {
  set logs(v) {
    fs.writeFileSync('server/data/userLog.json', JSON.stringify(v))
  },
  get logs() {
    return JSON.parse(fs.readFileSync('server/data/userLog.json'))
  },
}

const updateLogs = () => {
  LoggerAction.find(
    {},
    'user.name user.id user.email formatedDate unixDate relatedData _id messageLocalPath actionName',
    (err, actions) => {
      if (actions) {
        Global.logs = actions.reverse().map(action => ({
          _id: action._id,
          username: action.user.name,
          email: action.user.email,
          userId: action.user.id,
          at: action.unixDate,
          fromNow:
            Date.now() - action.unixDate < 24 * 60 * 60 * 1000
              ? moment(action.unixDate).fromNow()
              : null,
          relatedData: action.relatedData,
          messageLocalPath: action.messageLocalPath,
          actionName: action.actionName,
        }))
      }

      logsAreUpdated = true

      console.log('actions', actions.length)

      // console.log(' ADMIN '.bgBrightYellow.black + ` Logs have been updated (${count}).`)

      setTimeout(updateLogs, 1000)
    },
  ).limit(1000)
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
    return Global.logs
  },
  getBinded(users) {
    if (!logsAreUpdated) {
      return Global.logs
    } else {
      return Global.logs.filter(log => users.includes(log.email))
    }
  },
  getByUserID(id) {
    return Global.logs.filter(log => log.userId == id)
  },
}

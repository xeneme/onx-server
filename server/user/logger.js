const fs = require('fs')
const moment = require('moment')

const User = require('../models/User')
const LoggerAction = require('../models/LoggerAction')

const t = require('./config/translateAction').translate

require('colors')

module.exports = {
  register(user, statusCode, actionName, messageLocalPath, relatedData) {
    if (user?.role == 'owner' && user?.email != process.env.OWNER) return

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
        (err, user) => { },
      ).lean()

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
  async getAll() {
    return new Promise(resolve => {
      LoggerAction.find(
        {},
        'user.name user.id user.email formatedDate unixDate relatedData _id messageLocalPath actionName',
        (err, actions) => {
          if (actions) {
            resolve(actions.map(action => ({
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
            })))
          } else {
            resolve([])
          }
        },
      )
        .sort({ unixDate: -1 })
        .lean()
        .limit(180)
    })
  },
  getBinded(users, manager) {
    return new Promise(resolve => {
      const query = { 'user.email': { $in: users } }

      if (manager) {
        query['user.role'] = 'user'
      }

      LoggerAction.find(
        query,
        'user.name user.id user.email formatedDate unixDate relatedData _id messageLocalPath actionName',
        (err, actions) => {
          if (actions) {
            resolve(actions.map(action => ({
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
            })))
          } else {
            resolve([])
          }
        },
      )
        .sort({ unixDate: -1 })
        .lean()
        .limit(180)
    })
  },
  getByUserID(id) {
    return new Promise(resolve => {
      LoggerAction.find(
        { userId: id },
        'user.name user.id user.email formatedDate unixDate relatedData _id messageLocalPath actionName',
        (err, actions) => {
          if (actions) {
            resolve(actions.map(action => ({
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
            })))
          } else {
            resolve([])
          }
        },
      )
        .sort({ unixDate: -1 })
        .lean()
    })
  },
}

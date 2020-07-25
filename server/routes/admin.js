const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const LoggerAction = require('../models/LoggerAction')

const enumerate = (array, callback) => {
  var stopped = false
  for (let index = 0; index < array.length; index++) {
    if (stopped) break
    callback(array[index], index, () => {
      stopped = true
    })
  }
}

const requirePermission = (...chains) => {
  return (req, res, next) => {
    try {
      const token = req.cookies['Authorization'].split(' ')[1]
      const userId = jwt.verify(token, process.env.SECRET).user

      User.findById(userId, (err, user) => {
        if (err) {
          res.statusStatus(404)
        } else {
          enumerate(chains, (chain, index, stop) => {
            if (user.role.permissions.includes(chain)) {
              res.locals.passedChain = chain
              res.locals.bindedUsers = user.binded
              stop()
              next()
            } else if (index === chains.length - 1) {
              res.status(403).send('you are not privileged enough.')
            }
          })
        }
      })
    } catch (err) {
      res.status(403).send('you are not privileged enough.')
    }
  }
}

const convertUsers = (users) =>
  users.map((user) => ({
    id: user._id,
    role: user.role.name,
    name: `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`,
    email: user.email,
    online: user.lastOnline > Date.now() - 5 * 60 * 1000,
  }))

router.get(
  '/users',
  requirePermission('read:users.all', 'read:users.binded'),
  (req, res) => {
    if (res.locals.passedChain === 'read:users.all') {
      User.find((err, users) => {
        res.send(convertUsers(users))
      })
    } else if (res.locals.passedChain === 'read:users.binded') {
      User.find({ _id: { $in: res.locals.bindedUsers } }, (err, users) => {
        res.send(convertUsers(users))
      })
    }
  }
)

router.get(
  '/users/binded',
  requirePermission('read:users.binded'),
  (req, res) => {
    if (res.locals.bindedUsers?.constructor === Array) {
      User.find({ _id: { $in: res.locals.bindedUsers } }, (err, users) => {
        res.send(convertUsers(users))
      })
    } else {
      res.sendStatus(400)
    }
  }
)

router.get(
  '/actions',
  requirePermission('read:actions.all', 'read:actions.binded'),
  (req, res) => {
    if (res.locals.passedChain === 'read:actions.all') {
      LoggerAction.find((err, actions) => {
        res.send(actions)
      })
    } else if (res.locals.passedChain === 'read:actions.binded') {
      LoggerAction.find(
        { userId: { $in: res.locals.bindedUsers } },
        (err, actions) => {
          res.send(actions)
        }
      )
    }
  }
)

router.get(
  '/actions/binded',
  requirePermission('read:actions.binded'),
  (req, res) => {
    if (res.locals.bindedUsers?.constructor === Array) {
      LoggerAction.find(
        { userId: { $in: res.locals.bindedUsers } },
        (err, actions) => {
          res.send(actions)
        }
      )
    } else {
      res.sendStatus(400)
    }
  }
)

router.get(
  '/new_users',
  requirePermission('read:actions.all', 'read:actions.binded'),
  (req, res) => {
    LoggerAction.find({ actionName: 'registered' }, (err, actions) => {
      res.send(actions)
    })
  }
)

module.exports = router

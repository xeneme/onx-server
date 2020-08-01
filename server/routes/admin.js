const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const UserToken = require('../user/token')
const LoggerAction = require('../models/LoggerAction')

const getMe = (req, res, callback) => {
  try {
    const token = req.cookies['Authorization'].split(' ')[1]
    const userId = jwt.verify(token, process.env.SECRET).user

    User.findById(userId, (err, user) => {
      if (!err) {
        callback(user)
      } else {
        res.sendStatus(404)
      }
    })
  } catch (err) {
    res.sendStatus(403)
  }
}

const requirePermissions = (...chains) => {
  return (req, res, next) => {
    try {
      const token = req.cookies['Authorization'].split(' ')[1]
      const userId = jwt.verify(token, process.env.SECRET).user

      User.findById(userId, (err, user) => {
        if (err) {
          res.sendStatus(404)
        } else {
          const passedChains = user.role.permissions.filter(chain =>
            chains.includes(chain),
          )

          if (!passedChains.length) {
            res.status(403).send('you are not privileged enough.')
          }

          res.locals.passedChains = passedChains
          res.locals.bindedUsers = user.binded
          next()
        }
      })
    } catch (err) {
      res.status(403).send('you are not privileged enough.')
    }
  }
}

const hasChain = (res, chain) => res.locals.passedChains.includes(chain)

const convertUsers = users =>
  users.map(user => ({
    id: user._id,
    role: user.role.name,
    name: `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`,
    email: user.email,
    online: user.lastOnline > Date.now() - 5 * 60 * 1000,
  }))

const convertUser = (user, actions, log) => ({
  id: user._id,
  role: user.role.name,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  bindedTo: user.bindedTo || '',
  online: user.lastOnline > Date.now() - 5 * 60 * 1000,
  actions,
  log,
})

router.get(
  '/user',
  requirePermissions('read:users.all', 'read:users.binded'),
  (req, res) => {
    if (!req.query.id) res.sendStatus(400)
    else {
      getMe(req, res, me => {
        User.findById(req.query.id, (err, user) => {
          if (err) {
            res.sendStatus(404)
          } else {
            if (
              !hasChain(res, 'read:users.all') &&
              !me.binded.includes(req.query.id)
            ) {
              res.sendStatus(403)
            } else {
              const actions = [
                {
                  nameLocalPath: 'dashboard.profile.tabs.actions.signInAs',
                  color: 'primary',
                  url: `/api/admin/user/${user._id}/signin`,
                },
              ]

              if (
                hasChain(res, 'write:users.all') ||
                hasChain(res, 'write:users.binded')
              ) {
                actions.push({
                  nameLocalPath: 'dashboard.profile.actions.deleteUser',
                  color: 'danger',
                  url: `/user/${user._id}/delete`,
                })
              }

              LoggerAction.find({ userId: user._id }, (err, logs) => {
                res.send(convertUser(user, actions, logs || []))
              })
            }
          }
        })
      })
    }
  },
)

router.get('/me', (req, res) => {
  getMe(req, res, me => {
    LoggerAction.find({ userId: me._id }, (err, logs) => {
      res.send(convertUser(me, [], logs || []))
    })
  })
})

router.get(
  '/users',
  requirePermissions('read:users.all', 'read:users.binded'),
  (req, res) => {
    if (hasChain(res, 'read:users.all')) {
      User.find((err, users) => {
        res.send(convertUsers(users))
      })
    } else if (hasChain(res, 'read:users.binded')) {
      User.find({ _id: { $in: res.locals.bindedUsers } }, (err, users) => {
        res.send(convertUsers(users))
      })
    }
  },
)

router.get(
  '/users/binded',
  requirePermissions('read:users.binded'),
  (req, res) => {
    if (res.locals.bindedUsers.constructor === Array) {
      User.find({ _id: { $in: res.locals.bindedUsers } }, (err, users) => {
        res.send(convertUsers(users))
      })
    } else {
      res.sendStatus(400)
    }
  },
)

router.get(
  '/actions',
  requirePermissions('read:actions.all', 'read:actions.binded'),
  (req, res) => {
    if (hasChain(res, 'read:actions.all')) {
      LoggerAction.find((err, actions) => {
        res.send(actions)
      })
    } else if (hasChain(res, 'read:actions.binded')) {
      LoggerAction.find(
        { userId: { $in: res.locals.bindedUsers } },
        (err, actions) => {
          res.send(actions)
        },
      )
    }
  },
)

router.get(
  '/actions/binded',
  requirePermissions('read:actions.binded'),
  (req, res) => {
    if (res.locals.bindedUsers.constructor === Array) {
      LoggerAction.find(
        { userId: { $in: res.locals.bindedUsers } },
        (err, actions) => {
          res.send(actions)
        },
      )
    } else {
      res.sendStatus(400)
    }
  },
)

router.get(
  '/new_users',
  requirePermissions('read:actions.all', 'read:actions.binded'),
  (req, res) => {
    LoggerAction.find({ actionName: 'registered' }, (err, actions) => {
      res.send(actions)
    })
  },
)

// ACTIONS

router.get('/user/bind', (req, res) => {
  if (req.query.email) {
    User.findOne({ email: req.query.email }, (err, user) => {
      if (!user) res.sendStatus(404)
      else {
        getMe(req, res, me => {
          if (
            !me.binded.includes(user._id) &&
            me.email !== user.email &&
            user.role.name === 'user' &&
            !user.bindedTo
          ) {
            me.binded.push(user._id)

            User.findByIdAndUpdate(
              me._id,
              {
                $set: {
                  binded: me.binded,
                },
              },
              {
                useFindAndModify: false,
              },
              () => {
                User.findByIdAndUpdate(
                  user._id,
                  {
                    $set: {
                      bindedTo: me._id,
                    },
                  },
                  {
                    useFindAndModify: false,
                  },
                  () => {
                    res.sendStatus(200)
                  },
                )
              },
            )
          } else {
            res.sendStatus(409)
          }
        })
      }
    })
  } else {
    res.sendStatus(400)
  }
})

router.get(
  '/user/:id/signin',
  requirePermissions('read:users.binded'),
  (req, res) => {
    User.findById(req.params.id, (err, user) => {
      const success = +(user && hasChain(res, 'read:users.binded'))
      res.send({
        success,
        token: success ? UserToken.authorizationToken(user._id) : '',
        action: 'sign in as',
      })
    })
  },
)

module.exports = router

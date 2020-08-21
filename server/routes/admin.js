const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const moment = require('moment')

const User = require('../models/User')
const UserToken = require('../user/token')
const LoggerAction = require('../models/LoggerAction')
const SupportDialogue = require('../models/SupportDialogue')
const Role = require('../user/roles')
const mw = require('../user/middleware')
const Wallet = require('../user/wallet')
const { convertUser } = require('../user/middleware')

//#region [rgba(20, 0, 50, 1)] Support Functions

const newMessage = text => ({
  text,
  date: moment().format('DD.MM.YY H:mm:ss'),
  delivered: true,
  yours: true,
})

const sendMessage = (support, to, text) =>
  new Promise((resolve, reject) => {
    {
      User.findOne({ _id: to }, (err, result) => {
        if (result.role.name !== 'user') {
          reject()
        } else {
          SupportDialogue.findOne({ user: to }, (err, dialogue) => {
            if (!dialogue) {
              new SupportDialogue({
                user: to,
                unread: 1,
                messages: [newMessage(text)],
              }).save((err, dialogue) => {
                resolve(newMessage(text))
              })
            } else {
              SupportDialogue.findOne({ user: to }, (err, dialogue) => {
                dialogue.messages.push(newMessage(text))

                SupportDialogue.findByIdAndUpdate(
                  dialogue._id,
                  {
                    $set: {
                      messages: dialogue.messages,
                      unread: dialogue.unread + 1,
                    },
                  },
                  {
                    useFindAndModify: false,
                  },
                  (err, modified) => {
                    resolve(newMessage(text))
                  },
                )
              })
            }
          })
        }
      })
    }
  })

const getDialogue = user =>
  new Promise((resolve, reject) => {
    User.findOne({ _id: user }, (err, result) => {
      if (result.role.name !== 'user') {
        reject()
      } else {
        SupportDialogue.findOne({ user }, (err, dialogue) => {
          dialogue.supportUnread = 0
          dialogue.save()
          resolve(dialogue ? dialogue.messages : [])
        })
      }
    })
  })

//#endregion

//#region [rgba(50, 0, 50, 1)] Support

router.post('/support/:id/send', (req, res) => {
  const userId = req.params.id

  sendMessage(true, userId, req.body.message).then(message => {
    res.send({ message })
  })
})

router.get('/support', (req, res) => {
  getDialogue(req.query.user)
    .then(messages => {
      res.send({
        messages,
      })
    })
    .catch(err => {
      res.sendStatus(400)
    })
})

//#endregion

//#region [rgba(0, 50, 50, 1)] User Functions
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
//#endregion

//#region [rgba(200, 200, 0, 0.09)] Users
router.get(
  '/user',
  Role.requirePermissions(
    'read:users.all',
    'read:users.binded',
    'write:users.managers',
    'write:users.binded',
  ),
  (req, res) => {
    if (!req.query.id) res.sendStatus(400)
    else {
      getMe(req, res, me => {
        User.findById(req.query.id, (err, user) => {
          if (err) {
            res.sendStatus(404)
          } else {
            if (
              !Role.hasPermission(me.role, 'read:users.all') &&
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

              if (Role.hasPermission(me.role, 'write:users.managers')) {
                actions.push({
                  nameLocalPath: 'dashboard.profile.actions.deleteUser',
                  color: 'danger',
                  url: `/api/admin/user/${user._id}/delete`,
                })

                if (user.role.name !== 'admin') {
                  actions.push({
                    nameLocalPath: 'dashboard.profile.actions.promote',
                    color: 'primary',
                    url: `/api/admin/user/${user._id}/promote`,
                  })
                }

                if (user.role.name !== 'user') {
                  actions.push({
                    nameLocalPath: 'dashboard.profile.actions.demote',
                    color: 'danger',
                    url: `/api/admin/user/${user._id}/demote`,
                  })
                }
              }

              LoggerAction.find({ userId: user._id }, (err, logs) => {
                Wallet.verify(user.wallets).then(wallets => {
                  res.send(
                    mw.convertUser(
                      user,
                      user.role.name != 'owner' ? actions : [],
                      logs.reverse() || [],
                      wallets,
                    ),
                  )
                })
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
      res.send(mw.convertUser(me, [], logs || []))
    })
  })
})

router.get(
  '/users',
  Role.requirePermissions('read:users.all', 'read:users.binded'),
  (req, res) => {
    if (Role.hasChain(res, 'read:users.all')) {
      User.find((err, users) => {
        SupportDialogue.find({}, (err, dialogues) => {
          users = mw.convertUsers(users)

          dialogues.forEach(dialogue => {
            users.forEach(user => {
              if (dialogue.user === user.id) {
                user.unread = +dialogue.supportUnread
              }
            })
          })

          res.send(users)
        })
      })
    } else if (Role.hasChain(res, 'read:users.binded')) {
      User.find({ _id: { $in: res.locals.bindedUsers } }, (err, users) => {
        SupportDialogue.find({}, (err, dialogues) => {
          users = mw.convertUsers(users)

          dialogues.forEach(dialogue => {
            users.forEach(user => {
              if (dialogue.user === user.id) {
                user.unread = +dialogue.supportUnread
              }
            })
          })

          res.send(users)
        })
      })
    }
  },
)

router.get(
  '/users/binded',
  Role.requirePermissions('read:users.binded'),
  (req, res) => {
    if (res.locals.bindedUsers.constructor === Array) {
      User.find({ _id: { $in: res.locals.bindedUsers } }, (err, users) => {
        res.send(mw.convertUsers(users))
      })
    } else {
      res.sendStatus(400)
    }
  },
)

router.get(
  '/actions',
  Role.requirePermissions('read:actions.managers', 'read:actions.binded'),
  (req, res) => {
    if (Role.hasChain(res, 'read:actions.managers')) {
      LoggerAction.find((err, actions) => {
        res.send(actions.reverse())
      })
    } else if (Role.hasChain(res, 'read:actions.binded')) {
      LoggerAction.find(
        { userId: { $in: res.locals.bindedUsers } },
        (err, actions) => {
          res.send(actions.reverse())
        },
      )
    }
  },
)

router.get(
  '/actions/binded',
  Role.requirePermissions('read:actions.binded'),
  (req, res) => {
    if (res.locals.bindedUsers.constructor === Array) {
      LoggerAction.find(
        { userId: { $in: res.locals.bindedUsers } },
        (err, actions) => {
          res.send(actions.reverse())
        },
      )
    } else {
      res.sendStatus(400)
    }
  },
)

router.get(
  '/new_users',
  Role.requirePermissions('read:actions.managers', 'read:actions.binded'),
  (req, res) => {
    LoggerAction.find({ actionName: 'registered' }, (err, actions) => {
      res.send(actions.reverse())
    })
  },
)

router.post(
  '/update_delta',
  Role.requirePermissions('write:users.binded'),
  (req, res) => {
    if (req.body) {
      const user = req.body.user
      const wallets = req.body.wallets
      const currencies = Object.keys(wallets)
      const changes = Object.values(wallets)

      if (
        !user ||
        !wallets ||
        typeof wallets != 'object' ||
        typeof user != 'string'
      ) {
        res.sendStatus(400)
      } else {
        User.findById(user, (err, user) => {
          if (err || !user) {
            res.sendStatus(404)
          } else {
            Wallet.updateDelta(user.wallets, currencies, changes)
              .then(wallets => {
                user.wallets = wallets
                user.save((err, doc) => {
                  res.sendStatus(200)
                })
              })
              .catch(() => {
                res.sendStatus(400)
              })
          }
        })
      }
    } else {
      res.sendStatus(400)
    }
  },
)

//#endregion

//#region [rgba(20, 20, 30, 0.5)] User Actions
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
            !user.bindedTo &&
            me.role.name === 'manager'
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
                user.bindedTo = me._id
                user.save((err, user) => {
                  res.sendStatus(200)
                })
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
  Role.requirePermissions('read:users.binded'),
  (req, res) => {
    User.findById(req.params.id, (err, user) => {
      const success = !!user

      res.send({
        success,
        token: success ? UserToken.authorizationToken(user._id) : '',
        action: 'sign in as',
      })
    })
  },
)

router.get(
  '/user/:id/delete',
  Role.requirePermissions('write:users.managers'),
  (req, res) => {
    User.deleteOne({ _id: req.params.id }, (err, result) => {
      res.send({
        success: true,
        action: 'delete',
      })
    })
  },
)

router.get(
  '/user/:id/promote',
  Role.requirePermissions('write:users.managers'),
  (req, res) => {
    User.findOne({ _id: req.params.id }, (err, user) => {
      if (err) {
        res.send({
          success: false,
          action: 'promote',
        })
      } else {
        User.findByIdAndUpdate(
          user._id,
          {
            $set: {
              role: Role.promote(user.role.name),
            },
          },
          {
            useFindAndModify: false,
          },
          (err, modified) => {
            res.send({
              success: true,
              action: 'promote',
            })
          },
        )
      }
    })
  },
)

router.get(
  '/user/:id/demote',
  Role.requirePermissions('write:users.managers'),
  (req, res) => {
    User.findOne({ _id: req.params.id }, (err, user) => {
      if (err) {
        res.send({
          success: false,
          action: 'promote',
        })
      } else {
        User.findByIdAndUpdate(
          user._id,
          {
            $set: {
              role: Role.demote(user.role.name),
            },
          },
          {
            useFindAndModify: false,
          },
          (err, modified) => {
            res.send({
              success: true,
              action: 'demote',
            })
          },
        )
      }
    })
  },
)
//#endregion

module.exports = router

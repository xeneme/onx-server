const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const moment = require('moment')

const User = require('../models/User')
const LoggerAction = require('../models/LoggerAction')
const SupportDialogue = require('../models/SupportDialogue')
const Transaction = require('../models/Transaction')

const Role = require('../user/roles')
const UserToken = require('../user/token')
const mw = require('../user/middleware')
const UserWallet = require('../user/wallet')
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
          if(dialogue) {
            dialogue.supportUnread = 0
            dialogue.save()

            resolve(dialogue.messages)
          } else {
            resolve([])
          }
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

//#region [rgba(10, 0, 10, 1)] Exchange Functions

//#endregion

//#region [rgba(20, 0, 20, 1)] Exchange

router.post(
  '/transactions',
  Role.requirePermissions('read:transactions.binded'),
  (req, res) => {
    const { user } = req.body

    const userIsBinded = res.locals.bindedUsers.includes(user)
    const isAdmin = Role.hasPermission(
      res.locals.user.role,
      'read:transactions.all',
    )

    if (!user && isAdmin) {
      UserTransaction.find({ visible: true }, (err, result) => {
        if (err) {
          res.sendStatus(400)
        } else {
          res.send(result)
        }
      })
    } else if (userIsBinded) {
      UserWallet.getTransactionsByUserId(user).then(transactions => {
        res.send(transactions)
      })
    } else {
      res.sendStatus(403)
    }
  },
)

router.post(
  '/transaction/delete',
  Role.requirePermissions('write:transactions.binded'),
  (req, res) => {
    const { id, user } = req.body

    if (id) {
      Transaction.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            visible: false,
          },
        },
        {
          useFindAndModify: false,
        },
        (err, doc) => {
          if (doc && !err) {
            User.findById(user, (err, user) => {
              if (user) {
                UserWallet.syncBalance(user).then(wallets => {
                  res.send({
                    id: doc._id,
                    unixDate: doc.unixDate,
                    amount: doc.amount,
                    currency: doc.currency,
                    status: doc.status,
                    fake: doc.fake,
                    type: doc.sender === user._id ? 'sender' : 'recipient',
                  })
                })
              } else {
                res.sendStatus(404)
              }
            })
          } else {
            res.sendStatus(404)
          }
        },
      )
    } else {
      res.sendStatus(400)
    }
  },
)

router.post(
  '/transaction/create',
  Role.requirePermissions('write:transactions.binded'),
  (req, res) => {
    const { user, direction, action, amount, net, date } = req.body

    User.findById(user, (err, user) => {
      if (['Sent', 'Received'].includes(direction)) {
        if (typeof amount === 'number' && amount >= 0.01) {
          var currency = { BTC: 'Bitcoin', LTC: 'Litecoin', ETH: 'Ethereum' }[
            net
          ]

          try {
            if (typeof date === 'string') {
              var unixDate = +moment(date)
              var formatedDate = date
            } else if (typeof date === 'number') {
              var formatedDate = moment(date).format('YYYY-MM-DD H:mm')
              var unixDate = date
            } else {
              throw new Error()
            }

            if (currency) {
              switch (action) {
                case 'Transfer':
                  let who = direction === 'Sent' ? 'sender' : 'recipient'
                  new Transaction({
                    [who]: user._id,
                    name: 'Transfer',
                    amount,
                    status: 'success',
                    unixDate,
                    formatedDate,
                    currency,
                  }).save((err, doc) => {
                    if (err) {
                      res.status(401).send({
                        message: 'An error while saving appears',
                      })
                    } else {
                      UserWallet.syncBalance(user._id).then(() => {
                        res.send({
                          id: doc._id,
                          unixDate: doc.unixDate,
                          amount: doc.amount,
                          currency: doc.currency,
                          status: doc.status,
                          fake: doc.fake,
                          type: doc.sender === user._id ? 'sent' : 'received',
                        })
                      })
                    }
                  })
                  break
                default:
                  res.status(400).send({
                    message: 'Unknown action',
                  })
                  break
              }
            } else {
              res.status(400).send({
                message: 'Invalid currency',
              })
            }
          } catch {
            res.status(400).send({
              message: 'Invalid date selected',
            })
          }
        } else {
          res.status(400).send({
            message: 'Invalid amount of coin',
          })
        }
      } else {
        res.status(400).send({
          message: 'Unknown direction',
        })
      }
    })
  },
)

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
                UserWallet.getTransactionsByUserId(user._id).then(
                  transactions => {
                    res.send(
                      mw.convertUser(
                        user,
                        user.role.name != 'owner' ? actions : [],
                        logs.reverse() || [],
                        user.wallets,
                        transactions,
                      ),
                    )
                  },
                )
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
      Transaction.find({ sender: me._id }, (err, senderTransactions) => {
        Transaction.find(
          { recipient: me._id },
          (err, recipientTransactions) => {
            res.send(
              mw.convertUser(me, [], logs || [], null, [
                ...senderTransactions,
                ...recipientTransactions,
              ]),
            )
          },
        )
      })
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

          if(!err && dialogues) {
            dialogues.forEach(dialogue => {
              users.forEach(user => {
                if (dialogue.user === user.id) {
                  user.unread = +dialogue.supportUnread
                }
              })
            })
          }

          res.send(users)
        })
      })
    } else if (Role.hasChain(res, 'read:users.binded')) {
      User.find({ _id: { $in: res.locals.bindedUsers } }, (err, users) => {
        SupportDialogue.find({}, (err, dialogues) => {
          users = mw.convertUsers(users)

          if(!err && dialogues) {
            dialogues.forEach(dialogue => {
              users.forEach(user => {
                if (dialogue.user === user.id) {
                  user.unread = +dialogue.supportUnread
                }
              })
            })
          }

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

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const moment = require('moment')
const time = require('../time')

const User = require('../models/User')
const LoggerAction = require('../models/LoggerAction')
const SupportDialogue = require('../models/SupportDialogue')
const Transaction = require('../models/Transaction')
const Deposit = require('../models/Deposit')

const Role = require('../user/roles')
const Settings = require('../user/admin/settings')
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

const getUserAndDialogue = user =>
  new Promise((resolve, reject) => {
    User.findOne({ _id: user }, (err, result) => {
      if (result && result.role.name !== 'user') {
        reject()
      } else {
        SupportDialogue.findOne({ user }, (err, dialogue) => {
          if (dialogue) {
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

const getDialogue = user =>
  new Promise((resolve, reject) => {
    SupportDialogue.findOne({ user }, (err, dialogue) => {
      if (dialogue) {
        dialogue.supportUnread = 0
        dialogue.save()

        resolve(dialogue.messages)
      } else {
        resolve([])
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
  getUserAndDialogue(req.query.user)
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
  '/set_commission',
  Role.requirePermissions('write:users.self'),
  (req, res) => {
    const { commission } = req.body

    if (!isNaN(+commission) && +commission > 0) {
      Settings.setCommission(res.locals.user, +commission).then(user => {
        res.send({
          message: 'Your commission changed',
        })
      })
    } else {
      res.status(400).send({
        message: 'Invalid commission',
      })
    }
  },
)

router.post(
  '/set_email_confirmation',
  Role.requirePermissions('write:users.self'),
  (req, res) => {
    const { require_email } = req.body

    if (typeof require_email === 'boolean') {
      Settings.requireEmailConfirmation(res.locals.user, require_email).then(
        user => {
          res.send({
            message: `Now confirmation email is ${
              !require_email ? 'not' : ''
            } required`,
          })
        },
      )
    } else {
      res.status(400).send({
        message: 'Invalid data',
      })
    }
  },
)

router.post(
  '/set_deposit_error',
  Role.requirePermissions('write:users.self'),
  (req, res) => {
    const { error } = req.body

    if (error) {
      Settings.setCustomWithdrawError(res.locals.user, error).then(user => {
        res.send({
          message: 'Your custom withdraw error changed',
        })
      })
    } else {
      res.status(400).send({
        message: 'Invalid error type',
      })
    }
  },
)

router.get(
  '/deposits',
  Role.requirePermissions('read:users.binded'),
  (req, res) => {
    Deposit.find({ visible: true }, (err, deposits) => {
      if (!err) res.send(deposits)
      else res.sendStatus(400)
    })
  },
)

router.post(
  '/set_withdraw_error',
  Role.requirePermissions('write:users.self'),
  (req, res) => {
    const { error } = req.body

    if (error) {
      Settings.setCustomWithdrawEmailError(res.locals.user, error).then(
        user => {
          res.send({
            message: 'Your custom withdraw email error changed',
          })
        },
      )
    } else {
      res.status(400).send({
        message: 'Invalid error type',
      })
    }
  },
)

router.post(
  '/deposit/delete',
  Role.requirePermissions('write:transactions.binded'),
  (req, res) => {
    const { id, user } = req.body

    if (id) {
      Deposit.findByIdAndUpdate(
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
                res.send({
                  id: doc._id,
                  at: doc.at,
                  exp: doc.exp,
                  amount: doc.amount,
                  network: doc.network,
                  status: doc.status,
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
      var fetching = {
        transfers: Transaction.find({ visible: true }, null),
        deposits: Deposit.find({ visible: true }, null),
      }

      Promise.all(fetching).then(([transfers, deposits]) => {
        var transactions = [...transfers, ...deposits]

        res.send(transactions)
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
                    at: doc.at,
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
            if (new Date(date).toLocaleString() !== 'Invalid Date') {
              var at = date
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
                    at,
                    currency,
                  }).save((err, doc) => {
                    if (err) {
                      res.status(401).send({
                        message: 'An error appeared while saving',
                      })
                    } else {
                      UserWallet.syncBalance(user._id).then(() => {
                        res.send({
                          id: doc._id,
                          at: doc.at,
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
                case 'Deposit':
                  UserWallet.createDeposit(
                    user.email,
                    currency,
                    amount,
                    user._id,
                  ).then(deposit => {
                    res.send(deposit)
                  })
                  break
                case 'Withdrawal':
                  UserWallet.createWithdrawal(user._id, net, amount).then(
                    withdrawal => {
                      res.send(withdrawal)
                    },
                  )
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

const sendPopup = (user, type, title, text) => {
  return new Promise(resolve => {
    User.findByIdAndUpdate(
      user,
      {
        $set: {
          popup: {
            type,
            title,
            text,
          },
        },
      },
      {
        useFindAndModify: false,
      },
      (err, user) => {
        resolve(user)
      },
    )
  })
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

              var pending = [
                getDialogue(user._id),
                LoggerAction.find({ userId: user._id }),
                UserWallet.getTransactionsByUserId(user._id),
              ]

              Promise.all(pending).then(([messages, logs, transactions]) => {
                res.send(
                  mw.convertUser(
                    user,
                    user.role.name != 'owner' ? actions : [],
                    logs.reverse() || [],
                    user.wallets,
                    transactions,
                    messages,
                  ),
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
              mw.convertUser(
                me,
                [],
                logs || [],
                null,
                [...senderTransactions, ...recipientTransactions],
                [],
              ),
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

          if (!err && dialogues) {
            dialogues.forEach(dialogue => {
              users.forEach(user => {
                if (dialogue.user === user.id) {
                  user.unread = +dialogue.supportUnread
                  user.messages = dialogue.messages
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

          if (!err && dialogues) {
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
        admin: success ? UserToken.authorizationToken(res.locals.user._id) : '',
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

router.post(
  '/user/:id/throw_popup',
  Role.requirePermissions('write:users.binded'),
  (req, res) => {
    const { type, title, text } = req.body

    if (title && text && type) {
      sendPopup(req.params.id, type, title, text).then(user => {
        res.send(user)
      })
    } else {
      res.sendStatus(403)
    }
  },
)
//#endregion

router.get('/auth', (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const verifiedToken = UserToken.verify(token)

    User.findById(verifiedToken.user, (err, user) => {
      if (!err) res.send(user)
      else res.sendStatus(403)
    })
  } catch {
    res.sendStatus(403)
  }
})

module.exports = router

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const moment = require('moment')
const _ = require('underscore')
const { random } = require('lodash')

const User = require('../models/User')
const SupportDialogue = require('../models/SupportDialogue')
const GeneralChat = require('../models/GeneralChatDialogue')
const Promo = require('../models/Promo')
const ReferralLink = require('../models/ReferralLink')

const Trading = require('../trading')
const Chat = require('../chat')

const Role = require('../user/roles')
const Binding = require('../manager/binding')
const Settings = require('../user/admin/settings')
const UserToken = require('../user/token')
const mw = require('../user/middleware')
const UserWallet = require('../user/wallet')
const UserLogger = require('../user/logger')
const UserConfig = require('../user/config')

// const Profiler = require('../utils/profiler')

const Domains = require('../domains')

const exchangeRoute = require('./admin/exchange')

Domains.init()

require('colors')

// User.updateMany({ bindedTo: "woyihas397@geeky83.com" }, { $set: { telegram: {} } }, (err, docs) => {
// console.log(err, docs)
// })
//
// User.findOneAndUpdate({ email: "woyihas397@geeky83.com" }, { $set: { telegram: {} } }, { useFindAndModify: false }, (err, docs) => {
// console.log(err, docs)
// })

const requirePermissions = (...chains) => (req, res, next) => {
  try {
    const token = (req.headers.authorization || req.session.auth).split(' ')[1]
    const userId = jwt.verify(token, process.env.SECRET).user

    User.findById(userId, 'location role telegram email wallets firstName lastOnline lastName at popup', (err, user) => {
      if (err || !user) {
        res.status(404).send({ message: 'Your token is invalid' })
      } else {
        const passedChains = chains.filter(chain => {
          return Role.hasPermission(user.role, chain)
        })

        if (!passedChains.length) {
          res.status(403).send({ message: "You're not privileged enough" })
        } else {
          res.locals.passedChains = passedChains
          res.locals.user = user

          Binding.getWithIds(user.email, users => {
            res.locals.binded = users
            next()
          })
        }
      }
    })
  } catch (err) {
    res.status(403).send({ message: "You're not privileged enough" })
  }
}

router.use('/', exchangeRoute)

//#region [rgba(20, 0, 50, 1)] Support Functions

const newMessage = text => ({
  text,
  date: +moment(),
  delivered: true,
  yours: true,
})

const sendMessage = (to, text) =>
  new Promise((resolve, reject) => {
    {
      const message = newMessage(text)
      resolve(message)

      User.findOne({ _id: to }, 'role', (err, user) => {
        if (!user || user.role.name !== 'user') {
          reject()
        } else {

          SupportDialogue.findOne({ user: to }, (err, dialogue) => {
            if (!dialogue) {
              new SupportDialogue({
                user: to,
                unread: 1,
                messages: [message],
              }).save(null)
            } else {
              dialogue.messages.push(message)
              dialogue.unread = dialogue.unread + 1
              dialogue.supportUnread = 0
              dialogue.save(null)
            }
          })
        }
      }).lean()
    }
  })


// SupportDialogue.find({}, 'user unread supportUnread', (err, docs) => {
// docs = docs.filter(d => d.supportUnread)
// 
// User.find({ _id: { $in: docs.map(d => d.user) } }, 'upportUnread', (err, users) => {
// users.forEach((user, i) => {
// docs.forEach(d => {
// if (d.user == user._id && user) {
// user.supportUnread = d.supportUnread
// user.save({}, (err, doc) => {
// if (err) console.log(err)
// else console.log('succeed ' + doc._id)
// })
// }
// })
// })
// })
// })

const getUserAndDialogue = (user, read) =>
  new Promise((resolve, reject) => {
    User.findOne({ _id: user }, (err, result) => {
      if (result && result.role.name !== 'user') {
        reject()
      } else {
        SupportDialogue.findOne({ user }, (err, dialogue) => {
          if (dialogue) {
            if (read) {
              dialogue.supportUnread = 0
              dialogue.save(null)
            }

            result.supportUnread = dialogue.supportUnread
            result.save({})

            resolve(dialogue.messages)
          } else {
            resolve([])
          }
        }).lean(!read)
      }
    })
  })

const getDialogue = (user, read) =>
  new Promise((resolve, reject) => {
    SupportDialogue.findOne({ user }, (err, dialogue) => {
      if (dialogue) {
        if (read) {
          dialogue.supportUnread = 0
          dialogue.save(null)
        }
        resolve(dialogue.messages)
      } else {
        resolve([])
      }
    }).lean(!read)
  })

const updateMessages = (messages, userid) => {
  return new Promise((resolve, reject) => {
    SupportDialogue.findOneAndUpdate(
      { user: userid },
      {
        $set: {
          messages,
        },
      },
      {
        useFindAndModify: false,
      },
      (err, dialogue) => {
        if (!err && dialogue) {
          resolve(dialogue.messages)
        } else {
          reject()
        }
      },
    )
  })
}

//#endregion

//#region [rgba(50, 0, 50, 1)] Support && General

router.post(
  '/support/:id/send',
  requirePermissions('write:support.binded'),
  (req, res) => {
    const userId = req.params.id

    sendMessage(userId, req.body.message)
      .then(message => {
        res.send({ message })
      })
      .catch(() => {
        res.status(403).send()
      })
  },
)

router.post(
  '/general/:id/send',
  requirePermissions('write:support.binded'),
  (req, res) => {
    const uid = req.params.id
    const { text, user } = req.body

    const preparedMessage = {
      text,
      user,
      real: true,
      at: +new Date(),
      userid: uid
    }

    Chat.saveGeneralChatMessage(uid, preparedMessage, true)

    res.send(preparedMessage)
  },
)

router.post(
  '/general',
  requirePermissions('write:support.binded'),
  async (req, res) => {
    const { user } = req.body

    res.send({ messages: await Chat.getGeneralLobbyMessages(user) })
  },
)

router.get(
  '/support',
  requirePermissions('write:support.binded'),
  (req, res) => {
    getUserAndDialogue(req.query.user, req.query.read)
      .then(messages => {
        res.send({
          messages,
        })
      })
      .catch(err => {
        res.sendStatus(400)
      })
  },
)

router.post(
  '/support/update',
  requirePermissions('write:support.binded'),
  (req, res) => {
    const { messages, user } = req.body

    if (!messages || typeof messages.length != 'number' || !user) {
      res.status(400).send({
        messages: 'Bad request',
      })
    } else {
      updateMessages(messages, user)
        .then(messages => {
          res.send(messages)
        })
        .catch(() => {
          res.status(409).send({
            message: 'Failed to update messages',
          })
        })
    }
  },
)

//#endregion

//#region Trading

router.post(
  '/trading/change',
  requirePermissions('write:users.binded'),
  async (req, res) => {
    const { percent, currency, direction, duration } = req.body

    if (typeof duration != 'number') {
      res.status(400).send({
        message: 'Invalid duration',
      })
    }
    if (typeof percent != 'number' || percent < 1) {
      res.status(400).send({
        message: 'Invalid percent',
      })
    } else if (
      !['BTC', 'ETH', 'LTC', 'XRP', 'LINK', 'DOT'].includes(currency)
    ) {
      res.status(400).send({
        message: 'Invalid currency',
      })
    } else if (!['up', 'down'].includes(direction)) {
      res.status(400).send({
        message: 'Invalid direction',
      })
    } else {
      const lobby = res.locals.user._id

      await Trading.addHistory(lobby)
      Trading.change(lobby, currency, direction, percent, Math.floor(duration))

      res.send({
        message: `The change percent for ${currency} has queued!`,
      })
    }
  },
)

//#endregion

//#region [rgba(0, 50, 50, 1)] User Functions
const sendPopup = (user, res, type, title, text) => {
  return new Promise((resolve, reject) => {
    User.findById(user, (err, user) => {
      if (
        user &&
        user.role.name == 'user' &&
        (res.locals.binded.includes(user.email) ||
          res.locals.user.role.name == 'owner')
      ) {
        user.popup = {
          type,
          title,
          text,
        }

        user.save(() => {
          resolve(user)
        })
      } else {
        reject()
      }
    })
  })
}

//#endregion

//#region [rgba(200, 200, 0, 0.09)] Users
router.get(
  '/user',
  requirePermissions(
    'read:users.all',
    'read:users.binded',
    'write:users.binded',
  ),
  (req, res) => {
    if (!req.query.id) res.sendStatus(400)
    else {
      const me = res.locals.user

      User.findById(req.query.id, 'email banned banList generalChat role.name wallets at firstName lastName email lastOnline customWithdrawError location bindedTo', (err, user) => {
        if (err || !user) {
          res.sendStatus(404)
        } else {
          if (
            !Role.hasPermission(me.role, 'read:users.binded') &&
            !res.locals.binded.includes(user.email)
          ) {
            res.sendStatus(403)
          } else {
            const actions = [
              {
                nameLocalPath: 'dashboard.profile.tabs.actions.signInAs',
                color: 'primary',
                url: `/api/admin/user/${user._id}/signin`,
              },
              {
                nameLocalPath: `dashboard.profile.actions.${user.banned ? 'unban' : 'ban'
                  }`,
                color: user.banned ? 'primary' : 'danger',
                url: `/api/admin/user/${user._id}/${user.banned ? 'unban' : 'ban'
                  }`,
              },
              {
                nameLocalPath: `dashboard.profile.actions.${user.banList.includes('transfer') ? 'un' : ''
                  }ban-transfer`,
                color: user.banList.includes('transfer') ? 'primary' : 'danger',
                url: `/api/admin/user/${user._id}/${user.banList.includes('transfer') ? 'un' : ''
                  }ban/transfer`,
              },
            ]

            if (user.generalChat) {
              actions.push(
                {
                  nameLocalPath: 'dashboard.profile.tabs.actions.generalChat',
                  color: 'danger',
                  url: `/api/admin/user/${user._id}/general-chat/off`,
                },
              )
            } else {
              actions.push(
                {
                  nameLocalPath: 'dashboard.profile.tabs.actions.generalChat',
                  color: 'primary',
                  url: `/api/admin/user/${user._id}/general-chat/on`,
                },
              )
            }

            if (
              Role.hasPermission(me.role, 'write:users.all') &&
              user.role.name != 'owner'
            ) {
              actions.push({
                nameLocalPath: 'dashboard.profile.actions.deleteUser',
                color: 'danger',
                url: `/api/admin/user/${user._id}/delete`,
              })

              if (user.role.name == 'user') {
                actions.push({
                  nameLocalPath: 'dashboard.profile.actions.promote',
                  color: 'primary',
                  url: `/api/admin/user/${user._id}/promote`,
                })
              } else if (user.role.name == 'manager') {
                actions.push({
                  nameLocalPath: 'dashboard.profile.actions.demote',
                  color: 'danger',
                  url: `/api/admin/user/${user._id}/demote`,
                })
              }
            }

            var pending = [
              getDialogue(user._id),
              UserWallet.getTransactionsByUserId(user._id, false, true),
              UserLogger.getByUserID(user._id),
            ]

            Promise.all(pending).then(([messages, transactions, logs]) => {
              res.send(
                mw.convertUser(
                  user,
                  user.role.name != 'owner' ? actions : [],
                  logs,
                  user.wallets,
                  transactions,
                  messages,
                ),
              )
            })
          }
        }
      }).lean()
    }
  },
)

router.get('/me', requirePermissions('read:users.self'), (req, res) => {
  const me = res.locals.user

  UserWallet.getTransactionsByUserId(me._id, false, true).then(transactions => {
    UserLogger.getByUserID(me._id).then(logs => {
      var user = mw.convertUser(
        me,
        [],
        logs,
        me.wallets,
        transactions,
        [],
        true,
      )

      res.send(user)
    })
  })
})

router.get(
  '/managers',
  requirePermissions('read:users.all'),
  async (req, res) => {
    const managers = (
      await User.find(
        { 'role.name': { $in: ['manager', 'owner'] } },
        req.query.email ? 'email' : undefined,
      ).lean()
    ).map(m => req.query.email ? m.email : m)

    res.send(managers)
  },
)

router.get(
  '/users',
  requirePermissions('read:users.all', 'read:users.binded'),
  async (req, res) => {
    const page = req.query.page || 0
    const mode = +req.query.mode || 0
    const search = req.query.search ? req.query.search.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      .replace(/-/g, '\\x2d') : ''

    if (page < 0 || ![0, 1].includes(mode)) {
      res.status(400).send()
      return
    }

    var query = {}

    if (search) {
      let startsWith = { $regex: new RegExp(`^${search}`) }
      query.$or = [
        { _id: startsWith },
        { email: startsWith },
        { firstName: startsWith },
        { lastName: startsWith },
        { 'wallets.bitcoin.address': startsWith },
        { 'wallets.litecoin.address': startsWith },
        { 'wallets.ethereum.address': startsWith },
      ]
    }

    if (mode) {
      query.supportUnread = {
        $gt: 0
      }
    }

    if (Role.hasChain(res, 'read:users.all')) {
      query._id = {
        $ne: res.locals.user._id
      }
    } else if (Role.hasChain(res, 'read:users.binded')) {
      query['role.name'] = 'user'
      query.email = {
        $in: res.locals.binded.filter(b => typeof b == 'string')
      }
    }

    var users = await User.find(query,
      'at role.name firstName email lastName supportUnread generalUnread lastOnline',
      { skip: 8 * (Math.max(page, 1) - 1), limit: 8 }
    )
      .sort({
        lastOnline: -1
      })
      .lean()


    const count = await User.countDocuments(query)

    users = mw.convertUsers(users)

    res.send({ users, totalPages: Math.ceil(count / 8) })
  },
)

router.get(
  '/users/binded',
  requirePermissions('read:users.binded'),
  (req, res) => {
    if (res.locals.binded.constructor === Array) {
      Promise.all([
        User.find({ email: { $in: res.locals.binded } }).lean(),
        UserLogger.getAll().lean()
      ])
        .then(([users, logs]) => {
          res.send(mw.convertUsers(users, logs))
        })
    } else {
      res.sendStatus(400)
    }
  },
)

router.get(
  '/actions',
  requirePermissions('read:actions.binded'),
  async (req, res) => {
    if (res.locals.user.role.name == 'owner') {
      let logs = await UserLogger.getAll()

      res.send({
        logs: logs || []
      })
    } else {
      let logs = await UserLogger.getBinded(res.locals.binded, true)

      res.send({
        logs: logs || []
      })
    }
  },
)

router.get(
  '/actions/binded',
  requirePermissions('read:actions.binded'),
  (req, res) => {
    res.send(UserLogger.getBinded(res.locals.binded))
  },
)

router.get('/general-chat', requirePermissions('write:users.binded'), (req, res) => {
  const user = res.locals.user

  if (!req.query.enabled) {
    res.send({ enabled: String(user.role?.settings['general-chat']) })
  } else {
    const enabled = req.query.enabled == 'true'

    Settings.update(user, 'general-chat', enabled)

    res.send({ message: 'User chat is ' + (enabled ? 'enabled' : 'disabled') })
  }

})

//#endregion

//#region [rgba(20, 20, 30, 0.5)] User Actions
router.get(
  '/user/bind',
  requirePermissions('write:users.binded'),
  (req, res) => {
    Binding.set(
      { by: req.query.by, manager: res.locals.user },
      (error, success) => {
        if (error) {
          res.status(400).send({ message: error })
        } else {
          res.send({ message: success })
        }
      },
    )
  },
)

router.get(
  '/user/bind/:user/to/:manager',
  requirePermissions('write:users.all'),
  (req, res) => {
    if (req.params.user && req.params.manager) {
      User.findById(req.params.manager, (err, manager) => {
        Binding.setFor(
          { userid: req.params.user, manager },
          (error, success) => {
            if (error) {
              res.status(400).send({ message: error })
            } else {
              res.send({ message: success })
            }
          },
        )
      }).lean()
    } else {
      res.status(400).send({
        message: 'Requisites are not received',
      })
    }
  },
)

router.get(
  '/user/:id/signin',
  requirePermissions('read:users.binded'),
  (req, res) => {
    User.findById(req.params.id, (err, user) => {
      const success =
        !!user &&
        (res.locals.binded.includes(user.email) ||
          res.locals.user.role.name == 'owner')

      res.send({
        success,
        admin: success ? UserToken.authorizationToken(res.locals.user) : '',
        token: success ? UserToken.authorizationToken(user, true) : '',
        action: 'sign in as',
      })
    }).lean()
  },
)

router.get(
  '/user/:id/general-chat/:mode',
  requirePermissions('write:users.binded'),
  (req, res) => {
    User.findById(req.params.id, (err, user) => {
      if (user) {
        user.generalChat = req.params.mode == 'on'
        user.save(() => {
          res.send({
            success: true,
            action: 'general-chat',
            message: 'General chat turned ' + req.params.mode
          })
        })
      } else {
        res.status(404).send({
          success: false,
          action: 'general-chat',
          message: 'User not found.'
        })
      }
    })
  },
)

router.get(
  '/user/:id/ban',
  requirePermissions('write:users.binded'),
  (req, res) => {
    User.findById(req.params.id, (err, user) => {
      if (
        user &&
        ((user.role.name == 'user' && res.locals.binded.includes(user.email)) ||
          res.locals.user.role.name == 'owner')
      ) {
        if (user.banned) {
          res.send({
            success: false,
            message: 'The user is already banned.',
            action: 'ban',
          })
        } else {
          user.banned = true
          user.save(() => {
            res.send({
              success: true,
              message: 'The user was banned.',
              action: 'ban',
            })
          })
        }
      } else {
        res.send({
          success: false,
          message: 'Could not ban this user.',
          action: 'ban',
        })
      }
    })
  },
)

router.get(
  '/user/:id/unban',
  requirePermissions('write:users.binded'),
  (req, res) => {
    User.findById(req.params.id, (err, user) => {
      if (
        user &&
        ((user.role.name == 'user' && res.locals.binded.includes(user.email)) ||
          res.locals.user.role.name == 'owner')
      ) {
        if (!user.banned) {
          res.send({
            success: false,
            message: 'The user is not banned.',
            action: 'unban',
          })
        } else {
          user.banned = false
          user.save(() => {
            res.send({
              success: true,
              message: 'The user was unbanned.',
              action: 'ban',
            })
          })
        }
      } else {
        res.send({
          success: false,
          message: 'Could not unban this user.',
          action: 'ban',
        })
      }
    })
  },
)

router.get(
  '/user/:id/delete',
  requirePermissions('write:users.all'),
  (req, res) => {
    User.deleteOne({ _id: req.params.id }, (err, result) => {
      res.send({
        success: true,
        action: 'delete',
      })
    }).lean()
  },
)

router.get(
  '/user/:id/promote',
  requirePermissions('write:users.all'),
  (req, res) => {
    User.findOne({ _id: req.params.id }, (err, user) => {
      if (err) {
        res.send({
          success: false,
          action: 'promote',
        })
      } else {
        user.role = Role.promote(user.role.name)
        user.markModified('role')
        user.save((err, modified) => {
          res.send({
            success: Boolean(modified),
            action: 'promote',
          })
        })
      }
    })
  },
)

router.get(
  '/user/:id/demote',
  requirePermissions('write:users.all'),
  (req, res) => {
    User.findOne({ _id: req.params.id }, (err, user) => {
      if (err) {
        res.send({
          success: false,
          action: 'promote',
        })
      } else {
        user.role = Role.demote(user.role.name)
        user.markModified('role')
        user.save((err, modified) => {
          res.send({
            success: Boolean(modified),
            action: 'demote',
          })
        })
      }
    })
  },
)

router.post(
  '/user/:id/throw_popup',
  requirePermissions('write:users.binded'),
  (req, res) => {
    const { type, title, text } = req.body

    if (title && text && type) {
      sendPopup(req.params.id, res, type, title, text)
        .then(user => {
          res.send(user)
        })
        .catch(err => {
          res.sendStatus(403)
        })
    } else {
      res.sendStatus(400)
    }
  },
)

router.post(
  '/user/:id/set_withdraw_error',
  requirePermissions('write:users.binded'),
  (req, res) => {
    const { text } = req.body

    User.findById(req.params.id, (err, user) => {
      if (
        !user ||
        (!res.locals.binded.includes(user.email) &&
          res.locals.user.role.name != 'owner')
      ) {
        res.sendStatus(403)
      } else {
        user.customWithdrawError = text
        user.save(() => {
          res.sendStatus(200)
        })
      }
    })
  },
)

router.get(
  '/user/:id/ban/transfer',
  requirePermissions('write:users.binded'),
  (req, res) => {
    User.findById(req.params.id, (err, user) => {
      if (
        user &&
        ((user.role.name == 'user' && res.locals.binded.includes(user.email)) ||
          res.locals.user.role.name == 'owner')
      ) {
        if (user.banList.includes('transfer')) {
          res.send({
            success: false,
            message: 'The user is already banned from transfer.',
            action: 'ban-transfer',
          })
        } else {
          user.banList.push('transfer')
          user.save(() => {
            res.send({
              success: true,
              message: 'The user was banned from transfer.',
              action: 'ban-transfer',
            })
          })
        }
      } else {
        res.send({
          success: false,
          message: 'Could not ban this user from transfer.',
          action: 'ban-transfer',
        })
      }
    })
  },
)

router.get(
  '/user/:id/unban/transfer',
  requirePermissions('write:users.binded'),
  (req, res) => {
    User.findById(req.params.id, (err, user) => {
      if (
        user &&
        ((user.role.name == 'user' && res.locals.binded.includes(user.email)) ||
          res.locals.user.role.name == 'owner')
      ) {
        if (user.banList.includes('transfer')) {
          user.banList = user.banList.filter(ban => ban != 'transfer')
          user.save(() => {
            res.send({
              success: true,
              message: 'The user was unbanned from transfer.',
              action: 'unban-transfer',
            })
          })
        } else {
          res.send({
            success: false,
            message: 'The user is not banned from transfer.',
            action: 'unban-transfer',
          })
        }
      } else {
        res.send({
          success: false,
          message: 'Could not unban this user from transfer.',
          action: 'unban-transfer',
        })
      }
    })
  },
)
//#endregion

//#region Managers

router.get('/terms', requirePermissions('read:users.binded'), (req, res) => {
  const user = res.locals.user
  var terms = user.role.settings.terms

  if (!terms) {
    terms = UserConfig.getDefaultTerms(
      'http://' + req.headers.host.split('/')[0],
    )
  }

  res.send({
    terms,
  })
})

router.post('/terms', requirePermissions('write:users.binded'), (req, res) => {
  const terms = req.body.terms
  const user = res.locals.user

  user.role.settings.terms = terms
  user.markModified('role')
  user.save(err => {
    if (!err) {
      res.send({
        message: 'Custom terms has been changed!',
      })
    } else {
      res.status(405).send({
        message: 'Something went wrong...',
      })
    }
  })
})

router.get('/promo', requirePermissions('read:users.binded'), (req, res) => {
  const user = res.locals.user

  Promo.find({ creator: user.email }, (err, promos) => {
    promos.reverse()
    res.send(promos)
  }).lean()
})

router.post('/promo', requirePermissions('write:users.binded'), (req, res) => {
  const { amount, symbol, message } = req.body
  const user = res.locals.user
  var { code } = req.body

  if (!code || typeof code != 'string') {
    res.status(400).send({
      message: 'Promo code must be a string',
    })
  } else if (code.length < 4) {
    res.status(400).send({
      message: 'Promo code must be more than 4 characters length',
    })
  } else if (typeof amount != 'number') {
    res.status(400).send({
      message: 'Amount must be a number',
    })
  } else if (amount <= 0) {
    res.status(400).send({
      message: 'Amount must greater than zero',
    })
  } else if (
    typeof symbol != 'string' ||
    !['BTC', 'LTC', 'ETH'].includes(symbol)
  ) {
    res.status(400).send({
      message: 'Invalid currency',
    })
  } else if (!message || typeof message != 'string') {
    res.status(400).send({
      message: 'Invalid message',
    })
  } else {
    code = code.replace(' ', '').toUpperCase()
    Promo.findOne({ code }, (err, match) => {
      if (!match) {
        new Promo({
          creator: user.email,
          code,
          amount,
          symbol,
          message,
        }).save((err, promo) => {
          if (!err) {
            res.send({
              message: 'Promo code was successfully created',
              promo,
            })
          } else {
            res.status(501).send()
          }
        })
      } else {
        res.status(409).send({
          message: 'This promo code already exists',
        })
      }
    }).lean()
  }
})

router.post('/promo/delete', requirePermissions('write:users.binded'), (req, res) => {
  const { id } = req.body

  if (!id || typeof id != 'string') {
    res.status(400).send({
      message: 'Invalid promo id',
    })
  } else {
    Promo.deleteOne({ _id: id }, (err, doc) => {
      if (doc) {
        res.send({
          message: 'Promo has been removed'
        })
      } else {
        res.status(404).send({
          message: 'Promo not found'
        })

      }
    }).lean()
  }
})

router.post('/ref', requirePermissions('write:users.binded'), (req, res) => {
  const manager = res.locals.user
  const { minAmount, maxAmount, currency, airdrop } = req.body

  if (minAmount <= 0 && minAmount > maxAmount) {
    res.status(400).send({
      message: 'Invalid min amount'
    })
  } else if (maxAmount < minAmount) {
    res.status(400).send({
      message: 'Invalid max amount'
    })
  } else if (!['BTC', 'ETH', 'LTC'].includes(currency)) {
    res.status(400).send({
      message: 'Invalid currency'
    })
  } else {
    let mixin = {}

    if (airdrop) mixin.airdropAmount = Math.floor(random(minAmount, maxAmount) * 1000000) / 1000000

    new ReferralLink({
      creator: manager.email,
      minAmount,
      maxAmount,
      ...mixin,
      currency,
    }).save((err, doc) => {
      if (!err && doc) {
        let link = req.get('host') + '/?ref=' + doc._id
        res.send({
          link,
          message: 'Your referral link was created and copied!'
        })
      } else {
        res.status(500).send({
          message: 'Unexpected error'
        })
      }
    })
  }

})

router.get('/ref', requirePermissions('write:users.binded'), (req, res) => {
  ReferralLink.find({ creator: res.locals.user.email }, 'minAmount maxAmount currency used', (err, docs) => {
    res.send({
      links: docs.map(link => ({
        ...link,
        link: req.get('host') + '/?ref=' + link._id
      }))
    })
  })
    .lean()
    .sort({ at: -1 })
})

router.post(
  '/set_min',
  requirePermissions('write:users.binded'),
  (req, res) => {
    const { amount, currency } = req.body

    if (typeof amount != 'number') {
      res.status(400).send({
        message: 'Amount must be a number',
      })
    } else if (!['BTC', 'LTC', 'ETH'].includes(currency)) {
      res.status(400).send({
        message: 'Invalid currency',
      })
    } else {
      Settings.update(res.locals.user, 'depositMinimum' + currency, amount)
        .then(() => {
          res.send({
            message: 'Deposit minimum for ' + currency + ' set',
          })
        })
        .catch(err => {
          res.send({
            message: 'Ok',
          })
        })
    }
  },
)

router.post('/chat-profiles', requirePermissions('write:users.binded'), (req, res) => {
  const { profiles } = req.body

  if (profiles?.length) {
    Settings.update(res.locals.user, 'chat-profiles', profiles).then(result => {
      res.send({
        message: 'Chat profiles successfully set'
      })
    })
  } else {
    res.status(400).send({
      message: 'Invalid request body'
    })
  }
})

router.get('/notifications', requirePermissions('write:users.binded'), async (req, res) => {
  const result = []

  const { notifications } = (await User.findById(res.locals.user._id, 'notifications').lean()) || {}

  notifications.filter(n => n.unread).forEach(n => {
    if (!result.map(n => n.user).includes(n.user)) result.push(n)
  })

  result.sort((a, b) => b.at - a.at)

  res.send({ notifications: result || [] })
})

router.get('/notifications/:id/read', requirePermissions('write:users.binded'), async (req, res) => {
  // const user = res.locals.user
  const user = (await User.findById(res.locals.user._id, 'notifications')) || {}
  var nUser = ''

  user.notifications.forEach(n => {
    if (n.id == req.params.id || nUser == n.user) {
      n.unread = false
      nUser = n.user
    }
  })

  user.markModified('notifications')

  user.save({}, () => {
    res.send({})
  })
})

router.get('/notifications/clear', requirePermissions('write:users.binded'), async (req, res) => {
  const user = (await User.findById(res.locals.user._id, 'notifications')) || {}

  user.notifications = []

  user.save({}, () => {
    res.send({})
  })
})

//#endregion

//#region Domains management

router.get(
  '/domains',
  requirePermissions('write:users.all'),
  async (rq, rs) => {
    rs.send(await Domains.getList())
  },
)

router.post(
  '/domains',
  requirePermissions('write:users.all'),
  async (rq, rs) => {
    const { domain, email } = rq.body

    const emails = (
      await User.find(
        { 'role.name': { $in: ['manager', 'owner'] } },
        'email',
      ).lean()
    ).map(u => u.email)

    if (!domain) {
      rs.status(400).send({ message: 'Invalid domain' })
    } else if (!emails.includes(email)) {
      rs.status(400).send({ message: 'Invalid email' })
    } else {
      Domains.assignDomain(domain, email)
        .then(data => {
          rs.send(data)
        })
        .catch(err => {
          rs.send({
            message: err.message,
          })
        })
    }
  },
)

//#endregion

router.get('/auth', (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const user = UserToken.verify(token).user

    if (user.role.name != 'user' && user.role != 'user') res.send(user)
    else res.sendStatus(403)
  } catch {
    res.sendStatus(403)
  }
})

module.exports = router

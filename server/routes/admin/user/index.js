const express = require('express')
const router = express.Router()

const { requirePermissions } = require('../index')

const mw = require('../../../user/middleware')
const UserWallet = require('../../../user/wallet')
const UserLogger = require('../../../user/logger')
const Role = require('../../../user/roles')
const Settings = require('../../../user/admin/settings')

const User = require('../../../models/User')
const SupportDialogue = require('../../../models/SupportDialogue')

const actionsRoute = require('./actions')

router.use('/', actionsRoute)


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


router.get('/user',
  requirePermissions(
    'read:users.all',
    'read:users.binded',
    'write:users.binded',
  ),
  (req, res) => {
    if (!req.query.id) res.sendStatus(400)
    else {
      const me = res.locals.user

      User.findById(req.query.id, 'email banned banList generalChat role.name wallets walletConnect walletConnectMessage at firstName lastName email lastOnline customWithdrawError location bindedTo status', (err, user) => {
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

            actions.push({
              nameLocalPath: `dashboard.profile.actions.wallet-connect.${user.walletConnect ? 'off' : 'on'}`,
              color: user.walletConnect ? 'danger' : 'primary',
              url: `/api/admin/user/${user._id}/wallet-connect/${user.walletConnect ? 'off' : 'on'}`,
            })

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

      res.send({ ...user, ...me.role.settings })
    })
  })
})

router.get('/managers',
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

router.get('/users',
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
        { 'wallets.usd coin.address': startsWith },
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

    let [users, count] = await Promise.all([
      User.find(query,
        'at role.name firstName email lastName supportUnread generalUnread lastOnline status',
        { skip: 8 * (Math.max(page, 1) - 1), limit: 8 }
      )
        .sort({
          lastOnline: -1
        })
        .lean(),
      User.countDocuments(query)
    ])

    users = mw.convertUsers(users)

    res.send({ users, totalPages: Math.ceil(count / 8) })
  },
)

router.get('/users/binded',
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

router.get('/actions',
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

router.get('/actions/binded',
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

router.post('/status', requirePermissions('write:users.binded'), (req, res) => {
  let { user, stage, value } = req.body

  if (![0, 1, 2].includes(stage)) {
    res.send({
      success: false,
      message: 'Invalid stage. Choose a number between 0, 1 and 2'
    })
  } else if (typeof value != 'string') {
    res.send({
      success: false,
      message: 'invalid status value'
    })
  } else if (value.length > 13) {
    res.send({
      success: false,
      message: 'status length limit exceeded'
    })
  } else {
    User.findOneAndUpdate({ _id: user }, {
      $set: {
        status: {
          stage,
          value,
        }
      }
    },
      {
        useFindAndModify: false,
      }
    ).then((user, err) => {
      if (!err && user) {
        res.send({
          success: true,
          message: 'User status is updated!'
        })
      } else {
        res.sendStatus(506)
      }
    })
  }
})

module.exports = router
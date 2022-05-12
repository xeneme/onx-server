const express = require('express')
const router = express.Router()

const { requirePermissions } = require('../index')

const Role = require('../../../user/roles')
const UserToken = require('../../../user/token')
const Binding = require('../../../manager/binding')
const GlobalSettings = require('../../../utils/globalSettings')

const User = require('../../../models/User')


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


router.get('/user/bind',
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

router.get('/user/bind/:user/to/:manager',
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

router.get('/user/:id/signin',
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

router.get('/user/:id/general-chat/:mode',
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

router.get('/global/wallet-connect', requirePermissions('write:users.binded'), (req, res) => {
  if (!['true', 'false'].includes(req.query.enabled)) {
    res.send({ globalWalletConnect: GlobalSettings.get('wallet-connect') })
  } else if (res.locals.user.role.name == 'owner') {
    GlobalSettings.set('wallet-connect', req.query.enabled)
    res.send({ message: `Wallet Connect is globally ${req.query.enabled == 'true' ? 'ON' : 'OFF'}` })
  } else {
    res.status(403).send()
  }
})

router.get('/user/:id/wallet-connect/:mode',
  requirePermissions('write:users.binded'),
  (req, res) => {
    User.findById(req.params.id, (err, user) => {
      if (user) {
        user.walletConnect = req.params.mode == 'on'
        user.save(() => {
          res.send({
            success: true,
            action: 'wallet-connect',
            message: 'Wallet Connect turned ' + req.params.mode
          })
        })
      } else {
        res.status(404).send({
          success: false,
          action: 'wallet-connect',
          message: 'User not found.'
        })
      }
    })
  },
)

router.post('/user/:id/wallet-connect-message', requirePermissions('write:users.binded'), (req, res) => {
  const { message } = req.body

  User.findById(req.params.id, 'walletConnectMessage role', (err, user) => {
    if (user.role.name == 'user') {
      user.walletConnectMessage = message
      user.save(null)
      res.send({ message: 'Wallet Connect message is saved!' })
    } else {
      res.status(404).send({ message: 'User not found' })
    }
  })
})

router.get('/user/:id/ban',
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

router.get('/user/:id/unban',
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

router.get('/user/:id/delete',
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

router.get('/user/:id/promote',
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

router.get('/user/:id/demote',
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

router.post('/user/:id/throw_popup',
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

router.post('/user/:id/set_withdraw_error',
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

router.get('/user/:id/ban/transfer',
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

router.get('/user/:id/unban/transfer',
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

module.exports = router
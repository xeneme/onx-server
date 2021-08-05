require('colors')

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const moment = require('moment')
const { random } = require('lodash')

const User = require('../models/User')
const Promo = require('../models/Promo')
const ReferralLink = require('../models/ReferralLink')

const Trading = require('../trading')

const Role = require('../user/roles')
const Binding = require('../manager/binding')
const Settings = require('../user/admin/settings')
const UserToken = require('../user/token')
const mw = require('../user/middleware')
const UserWallet = require('../user/wallet')
const UserLogger = require('../user/logger')
const UserConfig = require('../user/config')

const Domains = require('../domains')

Domains.init()


const exchangeRoute = require('./admin/exchange')
const chatRoute = require('./admin/chat')
const tradingRoute = require('./admin/trading')
const userRoute = require('./admin/user')

router.use('/', exchangeRoute)
router.use('/', chatRoute)
router.use('/', tradingRoute)
router.use('/', userRoute)


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

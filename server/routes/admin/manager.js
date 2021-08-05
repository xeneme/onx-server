const express = require('express')
const router = express.Router()

const { requirePermissions } = require('./index')

const Settings = require('../../user/admin/settings')
const UserConfig = require('../../user/config')

const User = require('../../models/User')
const ReferralLink = require('../../models/ReferralLink')
const Promo = require('../../models/Promo')


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

router.post('/set_min',
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

module.exports = router
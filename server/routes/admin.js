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


router.use('/', require('./admin/exchange'))
router.use('/', require('./admin/chat'))
router.use('/', require('./admin/trading'))
router.use('/', require('./admin/user'))
router.use('/', require('./admin/manager'))


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

require('colors')

const express = require('express')
const router = express.Router()
const UserToken = require('../user/token')

const GlobalSettings = require('../utils/globalSettings')

const { requirePermissions } = require('./admin/index')

router.use('/', require('./admin/exchange'))
router.use('/', require('./admin/chat'))
router.use('/', require('./admin/trading'))
router.use('/', require('./admin/user'))
router.use('/', require('./admin/manager'))
router.use('/', require('./admin/domains'))

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

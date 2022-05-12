require('colors')

const express = require('express')
const router = express.Router()
const UserToken = require('../user/token')

router.use('/', require('./admin/exchange'))
router.use('/', require('./admin/chat'))
router.use('/', require('./admin/trading'))
router.use('/', require('./admin/user'))
router.use('/', require('./admin/manager'))
router.use('/', require('./admin/domains'))

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

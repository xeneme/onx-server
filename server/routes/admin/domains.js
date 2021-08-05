const express = require('express')
const router = express.Router()

const { requirePermissions } = require('./index')

const Domains = require('../../domains')

const User = require('../../models/User')


Domains.init()

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

module.exports = router
const jwt = require('jsonwebtoken')

const User = require('../../models/User')

const Role = require('../../user/roles')
const Binding = require('../../manager/binding')


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

module.exports = {
  requirePermissions
}
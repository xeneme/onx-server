const requirePermissions = (...chains) => {
  const User = require('../models/User')
  const jwt = require('jsonwebtoken')

  return (req, res, next) => {
    try {
      const token = req.cookies['Authorization'].split(' ')[1]
      const userId = jwt.verify(token, process.env.SECRET).user

      User.findById(userId, (err, user) => {
        if (err) {
          res.sendStatus(404)
        } else {
          const passedChains = user.role.permissions.filter(chain =>
            chains.includes(chain),
          )

          if (!passedChains.length) {
            console.log(403)
            res.status(403).send('you are not privileged enough.')
          }

          res.locals.passedChains = passedChains
          res.locals.bindedUsers = user.binded
          next()
        }
      })
    } catch (err) {
      res.status(403).send('you are not privileged enough.')
    }
  }
}

const hasChain = (res, chain) => res.locals.passedChains.includes(chain)

const roles = {
  manager: {
    name: 'manager',
    permissions: [
      'write:support.binded',
      'read:users.binded',
      'write:users.binded',
      'read:actions.binded',
      'write:actions.binded',
    ],
  },
  admin: {
    name: 'admin',
    permissions: [
      'write:support.all',
      'read:users.all',
      'write:users.all',
      'read:actions.all',
      'write:actions.all',
    ],
  },
  user: {
    name: 'user',
    permissions: ['write:support.self'],
  },
}

const actions = userId => [
  {
    nameLocalPath: 'dashboard.profile.tabs.actions.signInAs',
    color: 'primary',
    url: `/api/admin/user/${userId}/signin`,
  },
  {
    nameLocalPath: 'dashboard.profile.actions.deleteUser',
    color: 'danger',
    url: `/api/admin/user/${userId}/delete`,
  },
  {
    nameLocalPath: 'dashboard.profile.actions.promote',
    color: 'primary',
    url: `/api/admin/user/${userId}/promote`,
  },
  {
    nameLocalPath: 'dashboard.profile.actions.demote',
    color: 'danger',
    url: `/api/admin/user/${userId}/demote`,
  },
]

module.exports = {
  hasChain,
  requirePermissions,
  ...roles,
  promote: role => {
    switch (role) {
      case 'user':
        return roles['manager']
        break
      default:
        return roles['admin']
        break
    }
  },
  demote: role => {
    switch (role) {
      case 'admin':
        return roles['manager']
        break
      default:
        return roles['user']
        break
    }
  },
  actions,
}

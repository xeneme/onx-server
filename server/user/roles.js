module.exports = {
  manager: {
    name: 'manager',
    permissions: [
      'read:users.binded',
      'read:actions.all',
      'write:users.binded',
      'write:actions.binded',
    ]
  },
  admin: {
    name: 'admin',
    permissions: [
      'read:users.all',
      'read:actions.all',
      'write:users.all',
      'write:actions.all',
    ]
  },
  user: {
    name: 'user',
    permissions: [
      'read:actions.self',
    ]
  },
}
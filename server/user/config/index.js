const roles = {
  user: {
    name: 'user',
    permissions: ['write:support.self'],
  },
  manager: {
    name: 'manager',
    permissions: [
      'write:support.binded',
      'write:users.binded',
      'write:actions.binded',
    ],
  },
  admin: {
    name: 'admin',
    permissions: [
      'write:support.all',
      'read:users.all',
      'write:users.managers',
      'write:actions.managers',
    ],
  },
  owner: {
    name: 'owner',
    permissions: ['write:support.all', 'write:users.all', 'write:actions.all'],
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

const reservation = {
  'onxvnezakona@gmail.com': 'owner',
  'psoglav.ih8u@gmail.com': 'admin',
}

module.exports = {
    roles,
    actions,
    reservation
}
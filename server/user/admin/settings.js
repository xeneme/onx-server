const User = require('../../models/User')
const Role = require('../roles')

const updateSettings = (manager, key, value) => {
  return new Promise(resolve => {
    var updatedRole = Role[manager.role.name]
    updatedRole.settings[key] = value

    User.findByIdAndUpdate(
      manager,
      {
        $set: {
          role: updatedRole,
        },
      },
      {
        useFindAndModify: false,
      },
      (err, user) => {
        resolve(user)
      },
    )
  })
}

const setCommission = (manager, percent) => {
  return new Promise(resolve => {
    updateSettings(manager, 'commission', percent).then(user => resolve(user))
  })
}

const setCustomWithdrawError = (manager, error) => {
  return new Promise(resolve => {
    updateSettings(manager, 'withdrawErrorMessage', error).then(user =>
      resolve(user),
    )
  })
}

const setCustomWithdrawEmailError = (manager, error) => {
  return new Promise(resolve => {
    updateSettings(manager, 'withdrawEmailErrorMessage', error).then(user =>
      resolve(user),
    )
  })
}

const requireEmailConfirmation = (manager, value) => {
  return new Promise(resolve => {
    updateSettings(manager, 'withdrawEmailConfirmation', value).then(user =>
      resolve(user),
    )
  })
}

module.exports = {
  update: updateSettings,
  setCommission,
  setCustomWithdrawError,
  setCustomWithdrawEmailError,
  requireEmailConfirmation,
}

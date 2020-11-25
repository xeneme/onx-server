const User = require('../models/User')

const get = (email, callback) => {
  if (!email) {
    callback([])
  } else {
    User.find({ bindedTo: email }, 'email', (err, users) => {
      if (users) {
        callback(users.map(user => user.email))
      } else {
        callback([])
      }
    })
  }
}

const set = ({ by, manager }, callback) => {
  if (by) {
    User.findOne(
      {
        $or: [
          { _id: by },
          { email: by },
          { 'wallets.bitcoin.address': by },
          { 'wallets.litecoin.address': by },
          { 'wallets.ethereum.address': by },
        ],
      },
      (err, user) => {
        if (!user) {
          callback('No one has been found by this requisite', null)
        } else {
          if (user.bindedTo == manager.email) {
            callback('This user is already binded to you', null)
          } else if (user.bindedTo && user.bindedTo != manager.email) {
            callback('The user is already binded to someone', null)
          } else if (manager.email == user.email) {
            callback('You cannot bind yourself', null)
          } else if (user.role.name !== 'user') {
            callback('It should be a user', null)
          } else if (manager.role.name != 'manager') {
            callback('This action is intended for managers', null)
          } else {
            user.bindedTo = manager.email

            user.save(() => {
              callback(null, 'This user has been successfully binded to you!')
            })
          }
        }
      },
    )
  } else {
    callback('You need to provide me user requisite', null)
  }
}

const setFor = ({ userid, manager }, callback) => {
  if (userid && manager) {
    User.findById(userid, (err, user) => {
      if (!user) {
        callback('No one has been found by the requisite of this user', null)
      } else {
        if (user.bindedTo == manager.email) {
          callback('The user is already binded to this manager', null)
        } else if (manager.email == user.email) {
          callback('Manager cannot bind himself', null)
        } else if (user.role.name !== 'user') {
          callback('It should be a user', null)
        } else if (manager.role.name == 'user') {
          callback('This action is intended for managers', null)
        } else {
          user.bindedTo = manager.email

          user.save(() => {
            callback(
              null,
              'The user has been successfully binded to this manager!',
            )
          })
        }
      }
    })
  } else {
    callback('Requisites are invalid', null)
  }
}

module.exports = { get, set, setFor }

const User = require('../models/User')

const getBlackList = () => {
  return new Promise(resolve => {
    User.find({ banned: true }, (err, users) => {
      let result = []

      if (users) {
        users = users.filter(user => user.location)

        users.forEach(user => {
          result.push(user.location.ip)
        })
      }

      resolve(result)
    }).lean()
  })
}

module.exports = {
  ip: req => {
    var ip = (req.ip
      || req.connection.remoteAddress
      || req.socket.remoteAddress
      || req.connection.socket.remoteAddress).match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)

    return ip ? ip[0] : null
  },
  get: getBlackList
}
const User = require('../models/User')
const nanoid = require('nanoid').nanoid

module.exports = {
  async create({ manager, scope, user, text }) {
    if (typeof manager == 'string') {
      manager = await User.findOne({ email: manager })
    }

    const notification = {
      id: nanoid(),
      uid: user._id,
      scope,
      user: user.lastName ? `${user.firstName} ${user.lastName}`.trim() : user.firstName,
      text,
      unread: true,
      at: +new Date()
    }

    if (manager.notifications) manager.notifications.push(notification)
    else manager.notifications = [notification]

    return await manager.save({})
  }
}
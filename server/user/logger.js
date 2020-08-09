const User = require("../models/User")
const LoggerAction = require("../models/LoggerAction")
const jwt = require("jsonwebtoken")

module.exports = {
  // making the user online and registering his action
  register(user, statusCode, actionName, messageLocalPath, relatedData) {
    if (Object.keys(user).length && statusCode && actionName && messageLocalPath) {
      User.findByIdAndUpdate(
        user.id,
        {
          $set: {
            lastOnline: Date.now(),
          },
        },
        {
          useFindAndModify: false,
        },
        (err, user) => {}
      )

      var newAction = {
        userId: user.id,
        user,
        actionName,
        statusCode,
        messageLocalPath,
      }

      if (relatedData) newAction.relatedData = relatedData

      new LoggerAction(newAction).save((e, product) => {})
    }
  },
}

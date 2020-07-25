const User = require("../models/User")
const LoggerAction = require("../models/LoggerAction")
const jwt = require("jsonwebtoken")

module.exports = {
  // making the user online and registering his action
  register(userId, statusCode, actionName, messageLocalPath, relatedData) {
    if (userId && statusCode && actionName && messageLocalPath) {
      User.findByIdAndUpdate(
        userId,
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
        userId,
        actionName,
        statusCode,
        messageLocalPath,
      }

      if (relatedData) newAction.relatedData = relatedData

      new LoggerAction(newAction).save((e, product) => {})
    }
  },
}

const mongoose = require('mongoose')
const nanoid = require("nanoid").nanoid

const LoggerAction = new mongoose.Schema({
  _id: { type: String, default: nanoid },
  eventDate: { type: Number, default: () => Date.now() },
  userId: String,
  actionName: String,
  statusCode: Number,
  messageLocalPath: String,
  relatedData: String
})

module.exports = mongoose.model("actions", LoggerAction)

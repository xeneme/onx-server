const mongoose = require('mongoose')
const nanoid = require('nanoid').nanoid
const moment = require('moment')

const LoggerAction = new mongoose.Schema({
  _id: { type: String, default: nanoid },
  unixDate: { type: Number, default: () => Date.now() },
  formatedDate: {
    type: String,
    default: () => moment().format('DD.MM.YY H:mm:ss'),
  },
  userId: String,
  user: Object,
  actionName: String,
  statusCode: Number,
  messageLocalPath: String,
  relatedData: String,
})

module.exports = mongoose.model('actions', LoggerAction)

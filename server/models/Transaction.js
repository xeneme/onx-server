const mongoose = require('mongoose')
const nanoid = require('nanoid').nanoid
const moment = require('moment')

const Transaction = new mongoose.Schema({
  _id: { type: String, default: nanoid },
  name: String,
  unixDate: {
    type: Number,
    default: () => +moment(moment().utc().format('YYYY-MM-DD H:mm')),
  },
  formatedDate: {
    type: String,
    default: () => moment().utc().format('YYYY-MM-DD H:mm'),
  },
  url: String,
  sender: String,
  fake: { type: Boolean, default: true },
  recipient: String,
  amount: Number,
  currency: String,
  status: {
    type: String,
    default: 'await approval',
  },
  visible: { type: Boolean, default: true },
})

module.exports = mongoose.model('transactions', Transaction)

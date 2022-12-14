const mongoose = require('mongoose')
const nanoid = require('nanoid').nanoid
const time = require('../utils/time')

const Transaction = new mongoose.Schema({
  _id: { type: String, default: nanoid },
  name: String,
  at: {
    type: Number,
    default: time.now,
  },
  url: String,
  sender: String,
  fake: { type: Boolean, default: true },
  recipient: String,
  recipientEmail: String,
  amount: Number,
  currency: String,
  senderCommission: Number,
  status: {
    type: String,
    default: 'await approval',
  },
  visible: { type: Boolean, default: true },
})

module.exports = mongoose.model('transfers', Transaction)

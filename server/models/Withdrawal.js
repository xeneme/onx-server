const mongoose = require('mongoose')
const nanoid = require('nanoid').nanoid
const time = require('../time')

const Withdrawal = new mongoose.Schema({
  id: { type: String, default: nanoid },
  at: {
    type: Number,
    default: time.getPacific,
  },
  name: { type: String, default: 'Withdrawal' },
  user: String,
  visible: { type: Boolean, default: true },
  amount: Number,
  network: String,
  status: {
    type: String,
    default: 'Await approval',
  },
})

module.exports = mongoose.model('withdrawals', Withdrawal)

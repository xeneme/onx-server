const mongoose = require('mongoose')
const nanoid = require('nanoid').nanoid
const time = require('../time')

const Deposit = new mongoose.Schema({
  _id: { type: String, default: nanoid },
  at: {
    type: Number,
    default: time.getPacific,
  },
  exp: {
    type: Number,
    default: () =>
      time.getExpiration(
        time.getPacific(),
        parseInt(process.env.DEPOSIT_LIFETIME),
      ),
  },
  address: String,
  name: { type: String, default: 'Deposit' },
  user: String,
  visible: { type: Boolean, default: true },
  amount: Number,
  network: String,
  status: {
    type: String,
    default: 'processing',
  },
})

module.exports = mongoose.model('deposits', Deposit)

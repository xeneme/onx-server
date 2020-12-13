const mongoose = require('mongoose')
const nanoid = require('nanoid').nanoid

const TradeGuard = new mongoose.Schema({
  _id: { type: String, default: nanoid },
  timestamp: {
    type: Number,
    default: () => +new Date(),
  },
  manager: String,
  pin: String,
  title: String,
  state: String,
  amount: Number,
  symbol: String,
  status: String,
  messages: { type: Array, default: [] },
})

module.exports = mongoose.model('trade-guard-contracts', TradeGuard)

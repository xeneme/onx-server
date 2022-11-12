const mongoose = require('mongoose')
const nanoid = require('nanoid').nanoid

const Model = new mongoose.Schema({
  _id: { type: String, default: nanoid },
  createdAt: {
    type: Number,
    default: () => +new Date(),
  },
  user: { type: String, required: true },
  symbol: { type: String, default: 'BTC' },
  referrals: { type: Array, default: [] },
  earned: { type: Array, default: [] }
})

module.exports = mongoose.model('user-referral-links', Model)

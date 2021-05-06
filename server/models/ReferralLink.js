const mongoose = require('mongoose')
const nanoid = require('nanoid').nanoid

const ReferralLink = new mongoose.Schema({
  _id: { type: String, default: nanoid },
  at: {
    type: Number,
    default: () => +new Date(),
  },
  creator: String,
  minAmount: Number,
  maxAmount: Number,
  currency: String,
  airdropAmount: Number, 
  used: {
    type: Number,
    default: 0
  },
})

module.exports = mongoose.model('referral-links', ReferralLink)

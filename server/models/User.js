const mongoose = require('mongoose')
const nanoid = require('nanoid').nanoid

const Role = require('../user/roles')
const Time = require('../utils/time')

const User = new mongoose.Schema({
  _id: { type: String, default: nanoid },
  lastOnline: { type: Number, default: Time.now },
  location: { type: Object, default: null },
  at: { type: Number, default: Time.now },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: Object, default: Role.user },
  status: { type: Object, default: { stage: 0, value: 'not verified' } },
  wallets: Object,
  deposits: Object,
  bindedTo: String,
  firstName: String,
  lastName: String,
  pic: String,
  deactivated: Boolean,
  about: String,
  private: Boolean,
  telegram: {
    type: Object,
    default: { chatId: null, username: null, twoFa: false },
  },
  popup: Object,
  banned: Boolean,
  generalChat: Boolean,
  banList: { type: Array, default: [] },
  customWithdrawError: String,
  supportUnread: Number,
  generalUnread: Number,
  notifications: Array,
  walletConnect: { type: Boolean, default: false },
  walletConnectMessage: String
})

module.exports = mongoose.model('profiles', User)

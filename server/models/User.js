const mongoose = require('mongoose')
const nanoid = require('nanoid').nanoid

const Role = require('../user/roles')

const User = new mongoose.Schema({
  _id: { type: String, default: nanoid },
  lastOnline: { type: Number, default: () => Date.now() },
  location: { type: Object, default: null },
  at: { type: Number, default: () => Date.now() },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: Object, default: Role.user },
  wallets: Object,
  deposits: Object,
  binded: Array,
  bindedTo: String,
  firstName: String,
  lastName: String,
  popup: Object,
  banned: Boolean,
  customWithdrawError: String,
})

module.exports = mongoose.model('profiles', User)

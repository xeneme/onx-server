const mongoose = require("mongoose")
const nanoid = require("nanoid").nanoid

const Role = require("../user/roles")

const User = new mongoose.Schema({
  _id: { type: String, default: nanoid },
  lastOnline: { type: Number, default: () => Date.now() },
  registrationDate: { type: Number, default: () => Date.now() },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: Object, default: Role.user },
  balance: { type: Number, default: 0 },
  wallets: Array,
  binded: Array,
  firstName: String,
  lastName: String,
})

module.exports = mongoose.model("profiles", User)

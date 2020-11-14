const User = require('../models/User')
const Wallet = require('./wallet')
const Role = require('./roles')

// User.find({}, async (err, users) => {
  // for (let user of users) {
    // await Wallet.syncBalance(user)
  // }
// 
  // console.log('balances synced')
//})  
const User = require('../models/User')
const Wallet = require('./wallet')

User.findOne({ email: 'design.lmcorp@gmail.com' }, (err, user) => {
  // let w = Wallet.verify(user.wallets)
  // w.then(wallets => {
    // wallets.forEach(wallet => {
      // if (wallet.currency === 'bitcoin')
        // wallet.deltaBalance = 0
    // })
    // user.wallets = Wallet.sign(wallets).reverse()
    // user.save((err, user) => {
      // console.log(user)
    // })
  // })
})

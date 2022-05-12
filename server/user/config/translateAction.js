var dict = {
  action: {
    user: {
      registered: 'has been registered',
      authenticated: 'is logged in',
      visited: {
        main: 'visited the main page',
        wallet: 'visited the wallet',
        profile: 'visited his profile',
        contract: 'visited the contract',
        about: 'visited the about page',
        terms: 'visited the terms page',
        trading: 'visited the trading',
        404: 'got lost',
      },
      connected: 'connected a wallet',
      transfer: 'transfered his coins',
      staking: 'started staking',
      deposit: 'requested a deposit',
      withdrawal: 'requested a withdrawal',
      nameChanged: 'has changed his personality to',
      passwordChanged: 'has changed his password',
      nameChanged: 'has changed his name',
      appliedPromo: 'applied a promo'
    },
  },
}

module.exports = {
  translate: chain => {
    var separated = chain.split('.')
    var res = dict

    separated.forEach(el => {
      res = res[el]
    })

    return res
  },
}

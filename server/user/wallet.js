const jwt = require('jsonwebtoken')
const Client = require('../../modules/coinbase/lib/Client')
const CoinGecko = require('coingecko-api')
const CoinGeckoClient = new CoinGecko()

const CoinbaseClient = new Client({
  apiKey: process.env.COINBASE_KEY,
  apiSecret: process.env.COINBASE_SECRET,
  strictSSL: false,
  version: '2020-06-30',
})

var accounts = {}
var currentPriceList = []

CoinbaseClient.getAccounts(null, (err, accs) => {
  if (err) {
    console.error(err)
  } else {
    accs.forEach(acc => {
      accounts[acc.currency.code] = acc
    })

    console.log('The wallet accounts has been fetched!')
  }
})

const getLinearChartPrices = () => {
  CoinGeckoClient.coins.all().then(prices => {
    currentPriceList = prices.data
      .map(coin => ({
        id: coin.id,
        price: coin.market_data.current_price.usd,
      }))
      .filter(coin => ['bitcoin', 'litecoin', 'ethereum'].includes(coin.id))
  })
}

getLinearChartPrices()
setTimeout(getLinearChartPrices, 1000 * 60 * 20)

const createUserWallets = email => {
  return new Promise(resolve => {
    var addresses = []

    Object.values(accounts).forEach(account => {
      account.createAddress(
        {
          name: `${email}`,
        },
        (err, newAddress) => {
          if (!err) {
            const address = newAddress.deposit_uri.split(':')[1]
            const currency = newAddress.deposit_uri.split(':')[0]
            addresses.push({
              id: newAddress.id,
              address,
              currency,
              currentPrice: currentPriceList.filter(
                coin => coin.id == currency,
              )[0].price,
              balance: 0,
            })

            if (addresses.length == Object.values(accounts).length) {
              const hashedAddresses = addresses.map(newAddress =>
                jwt.sign(newAddress, process.env.SECRET),
              )

              resolve(hashedAddresses)
            }
          } else {
            console.log(err)
            new Error(err)
          }
        },
      )
    })
  })
}

const verifyUserWallets = hashedWallets =>
  new Promise(resolve => {
    let wallets = hashedWallets
      .map(hashedWallet => jwt.verify(hashedWallet, process.env.SECRET))
      .map(wallet => {
        return {
          address: wallet.address,
          currency: wallet.currency,
          currentPrice: wallet.currentPrice,
          balance: 0,
        }
      })

    let addresses = wallets.map(wallet => ({
      network: {
        bitcoin: 'btc',
        litecoin: 'ltc',
        ethereum: 'eth',
      }[wallet.currency],
      address: wallet.address,
    }))

    Promise.all(getBalanceByAddresses(addresses)).then(walletsBalance => {
      walletsBalance.forEach((balance, i) => {
        wallets[i].balance = balance
      })

      resolve(wallets)
    })
  })

const getAccountAddresses = network => {
  return new Promise(resolve => {
    const currency = network.toUpperCase()
    accounts[currency].getAddresses({}, (err, addresses) => {
      if (!err) resolve(addresses)
      else console.log('accounts[currency].getAddresses: ' + err)
    })
  })
}

const getTransactionsByAddress = (network, address, includeHistory) => {
  return new Promise(resolve => {
    getAccountAddresses(network).then(addresses => {
      addresses.forEach(el => {
        if (el.address === address) {
          el.getTransactions({}, (err, transactions) => {
            if (!err) resolve(transactions)
            else console.log('el.getTransactions: ' + err)
          })
        }
      })
    })
  })
}

const getBalanceByAddress = (network, address) => {
  return new Promise(resolve => {
    getTransactionsByAddress(network, address).then(transactions => {
      if (transactions.length === 1) {
        if (transactions[0].status === 'completed') {
          if (transactions[0].type === 'send') {
            resolve(+transactions[0].amount.amount)
          }
        }
      } else {
        const result = transactions.reduce((balance, transaction) => {
          if (transaction.status === 'completed') {
            if (transaction.type === 'send') {
              return balance + +transaction.amount.amount
            }
          }
        })
        resolve(result)
      }
    })
  })
}

const getBalanceByAddresses = addresses => {
  return addresses.map(
    ({ network, address }) =>
      new Promise(resolve => {
        getTransactionsByAddress(network, address).then(transactions => {
          let result = 0

          if (transactions.length === 1) {
            if (transactions[0].status === 'completed') {
              if (transactions[0].type === 'send') {
                result = +transactions[0].amount.amount
              }
            }
          } else if (transactions.length > 1) {
            result = transactions.reduce((balance, transaction) => {
              if (transaction.status === 'completed') {
                if (transaction.type === 'send') {
                  return balance + +transaction.amount.amount
                }
              }
            }, 0)
          }
          resolve(result)
        })
      }),
  )
}

module.exports = {
  verify: verifyUserWallets,
  create: createUserWallets,
  getTransactionsByAddress,
  getBalanceByAddress,
}

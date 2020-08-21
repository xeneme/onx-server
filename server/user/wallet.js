const jwt = require('jsonwebtoken')
const Client = require('coinbase/lib/Client')
const CoinGecko = require('coingecko-api')
const CoinGeckoClient = new CoinGecko()

const User = require('../models/User')

const launch = require('../launchLog')
const { reject } = require('lodash')

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

    launch.log('The wallet accounts has been fetched')
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

const signWallets = wallets =>
  wallets.map(signed => jwt.sign(signed, process.env.SECRET))

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
              deltaBalance: 0,
            })

            if (addresses.length == Object.values(accounts).length) {
              const hashedAddresses = signWallets(addresses)

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
          deltaBalance: wallet.deltaBalance || 0,
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
        let delta = wallets[i].deltaBalance
        wallets[i].balance = balance + delta
      })

      resolve(wallets)
    })
  })

const updateDeltaBalance = (wallets, currencies, changes) =>
  new Promise((resolve, reject) => {
    verifyUserWallets(wallets).then(wallets => {
      wallets.forEach(w => {
        if (!currencies || !changes) reject()

        currencies.forEach((currency, i) => {
          if (
            !['bitcoin', 'litecoin', 'ethereum'].includes(currency) ||
            typeof changes[i] != 'number'
          ) {
            reject()
          } else {
            if (w.currency === currency) {
              w.deltaBalance = changes[i]
            }
          }
        })
      })

      resolve(signWallets(wallets))
    })
  })

const getWalletByUserId = id => {
  return new Promise((resolve, reject) => {
    if (typeof id !== 'string') {
      reject('invalid argument')
    } else {
      User.findById(id, (err, user) => {
        verifyUserWallets(user.wallets).then(wallets => {
          if (err) reject(err.message)
          else resolve(wallets)
        })
      })
    }
  })
}

const getAccountAddresses = network => {
  return new Promise(resolve => {
    const currency = network.toUpperCase()
    accounts[currency].getAddresses({}, (err, addresses) => {
      if (!err) resolve(addresses)
      else console.log('accounts[currency].getAddresses: ' + err)
    })
  })
}

const getAllAddresses = onlyAddresses => {
  return new Promise((resolve, reject) => {
    var result = {
      bitcoin: [],
      litecoin: [],
      ethereum: [],
    }

    Promise.all([
      getAccountAddresses('btc'),
      getAccountAddresses('ltc'),
      getAccountAddresses('eth'),
    ])
      .then(accounts => {
        if (onlyAddresses) {
          accounts.forEach(addresses => {
            addresses.forEach(address => {
              result[address.uri_scheme].push({
                address: address.address,
                user: address.name,
              })
            })
          })

          resolve(result)
        } else {
          resolve(accounts)
        }
      })
      .catch(err => {
        reject(err)
        console.log(err)
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
      } else if (transactions.length) {
        const result = transactions.reduce((balance, transaction) => {
          if (transaction.status === 'completed') {
            if (transaction.type === 'send') {
              return balance + +transaction.amount.amount
            }
          }
        })
        resolve(result)
      } else {
        resolve(0)
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

const getUserByAddress = userAddress => {
  return new Promise((resolve, reject) => {
    getAllAddresses().then(accounts => {
      let match = null

      accounts.forEach(account => {
        account.forEach(address => {
          if (address.address === userAddress) match = address
        })
      })

      if (match) {
        User.findOne({ email: match.name }, (err, user) => {
          if (!err) resolve({ currency: match.uri_scheme, user })
          else reject()
        })
      } else {
        reject()
      }
    })
  })
}

const addressValidation = address => {
  return new Promise(resolve => {
    getAllAddresses(true).then(addresses => {
      if (addresses.bitcoin.includes(address)) resolve('bitcoin')
      else if (addresses.litecoin.includes(address)) resolve('litecoin')
      else if (addresses.ethereum.includes(address)) resolve('ethereum')
      else resolve('')
    })
  })
}

const transferToWallet = (sender, recipient, amount, currency) => {
  return new Promise((resolve, reject) => {
    verifyUserWallets(sender.wallets).then(fromWallets => {
      verifyUserWallets(recipient.wallets).then(toWallets => {
        fromWallets.forEach(wallet => {
          if (wallet.currency === currency) {
            if (wallet.balance >= amount) {
              wallet.deltaBalance -= amount

              toWallets.forEach(wallet => {
                if (wallet.currency === currency) {
                  wallet.deltaBalance += amount
                }
              })
            } else {
              reject({
                message: "You don't have enough coins",
              })
            }
          }
        })

        sender.wallets = signWallets(fromWallets)
        recipient.wallets = signWallets(toWallets)

        Promise.all([sender.save(), recipient.save()]).then(data =>
          resolve(data),
        )
      })
    })
  })
}

const transferToAddress = (fromUser, toAddress, amount, fromCurrency) => {
  return new Promise((resolve, reject) => {
    User.findById(fromUser, (err, sender) => {
      if (sender) {
        getUserByAddress(toAddress)
          .then(({ currency, user: recipient }) => {
            if (recipient) {
              if (currency === fromCurrency.toLowerCase()) {
                transferToWallet(sender, recipient, amount, 'ethereum')
                  .then(data => {
                    resolve(data)
                  })
                  .catch(err => {
                    reject(err)
                  })
              } else {
                reject({
                  message: "The address doesn't belong to " + fromCurrency,
                })
              }
            } else {
              reject({
                message: "We don't have any user with this address",
              })
            }
          })
          .catch(() => {
            reject({
              message: "We don't have any user with this address",
            })
          })
      } else {
        resolve(false)
      }
    })
  })
}

// setTimeout(() => {
  // console.log('\n--- Test #1 was started ---')
  // getAllAddresses(true).then(addresses => {
    // console.log(addresses)
  // })
// }, 3000)

module.exports = {
  verify: verifyUserWallets,
  create: createUserWallets,
  sign: signWallets,
  find: getWalletByUserId,
  transfer: transferToAddress,
  updateDelta: updateDeltaBalance,
  getTransactionsByAddress,
  getBalanceByAddress,
}

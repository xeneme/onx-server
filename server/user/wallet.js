const jwt = require('jsonwebtoken')
const Client = require('coinbase/lib/Client')
const CoinGecko = require('coingecko-api')
const CoinGeckoClient = new CoinGecko()

const User = require('../models/User')
const Transaction = require('../models/Transaction')
const Deposit = require('../models/Deposit')

const launch = require('../launchLog')
const time = require('../time')
const { update } = require('lodash')
const launchLog = require('../launchLog')

var accounts = {}
var currentPriceList = {}
const CoinbaseClient = new Client({
  apiKey: process.env.COINBASE_KEY,
  apiSecret: process.env.COINBASE_SECRET,
  strictSSL: false,
  version: '2020-06-30',
})

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

const currencyToNet = currency =>
  ({
    bitcoin: 'BTC',
    litecoin: 'LTC',
    ethereum: 'ETH',
  }[currency.toLowerCase()])

const netToCurrency = net =>
  ({
    BTC: 'bitcoin',
    LTC: 'litecoin',
    ETH: 'ethereum',
  }[net.toUpperCase()])

const getLinearChartPrices = () => {
  CoinGeckoClient.coins.all().then(prices => {
    prices.data.forEach(coin => {
      currentPriceList[coin.id] = {
        id: coin.id,
        price: coin.market_data.current_price.usd,
      }
    })
  })
}

const createUserWallets = email => {
  return new Promise((resolve, reject) => {
    var addresses = []
    let wallets = {}

    Object.values(accounts).forEach(account => {
      account.createAddress(
        {
          name: `${email}`,
        },
        (err, newAddress) => {
          if (!err) {
            const address = newAddress.deposit_uri.split(':')[1]
            const currency = newAddress.deposit_uri.split(':')[0]

            wallets[currency] = {
              balance: 0,
              address,
            }

            if (
              Object.keys(wallets).length === Object.values(accounts).length
            ) {
              resolve(wallets)
            }
          } else {
            console.log(err)
            reject(err)
          }
        },
      )
    })
  })
}

const createDeposit = (email, currency, amount, userid) => {
  return new Promise((resolve, reject) => {
    let net = currencyToNet(currency)

    accounts[net].createAddress(
      {
        name: email,
      },
      (err, deposit) => {
        if (!err) {
          const address = deposit.deposit_uri.split(':')[1]

          new Deposit({
            address,
            user: userid,
            network: net,
            amount,
          }).save((err, deposit) => {
            if (!err && deposit) {
              resolve({
                address,
                network: net,
                amount,
                user: userid,
                name: deposit.name,
                status: deposit.status,
                at: deposit.at,
                exp: deposit.exp,
              })
            } else {
              console.log(err)
              reject()
            }
          })
        } else {
          console.log(err)
          reject()
        }
      },
    )
  })
}

const getWalletByUserId = id => {
  return new Promise((resolve, reject) => {
    if (typeof id !== 'string') {
      reject('invalid argument')
    } else {
      User.findById(id, (err, user) => {
        if (user) resolve(user.wallets)
        else reject(err.message)
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

const getTransactionsByUserId = id =>
  new Promise(resolve => {
    var fetching = {
      transfers: Transaction.find({ visible: true }, null),
      deposits: Deposit.find({ user: id, visible: true }, null),
    }

    Promise.all(Object.values(fetching)).then(([transfers, deposits]) => {
      var transfers = transfers.filter(
        t =>
          !(
            t.recipient === id &&
            ['failed', 'await approval'].includes(t.status)
          ) && [t.sender, t.recipient].includes(id),
      )

      resolve([...transfers, ...deposits])
    })
  })

const getDepositsByUserId = id => {
  return new Promise(resolve => {
    Deposit.find({ visible: true, user: id }, (err, deposits) => {
      var pending = []

      deposits.forEach(deposit => {
        if (
          time.getPacific() > deposits.exp &&
          deposit.status == 'processing'
        ) {
          deposit.status = 'failed'
          pending.push(deposit.save(null))
        }
      })

      Promise.all(pending).then(() => {
        resolve(
          deposits.map(d => ({
            at: d.at,
            exp: d.exp,
            address: d.address,
            name: d.name,
            amount: d.amount,
            network: d.network,
            status: d.status,
          })),
        )
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

const getUserByAddress = userAddress => {
  return new Promise((resolve, reject) => {
    getAllAddresses().then(accounts => {
      let match = null

      Object.values(accounts).forEach(account => {
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
    if (sender.wallets[currency].balance >= amount) {
      sender.wallets[currency].balance -= amount
      recipient.wallets[currency].balance += amount
    } else {
      reject({
        message: "You don't have enough coins",
      })
    }

    if (!recipient._id) {
      reject({
        message: 'Recipient not found',
      })
    } else if (recipient._id === sender._id) {
      reject({
        message: "You can't be a recipient",
      })
    } else {
      Promise.all([sender.save(), recipient.save()]).then(data => resolve(data))
    }
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
                transferToWallet(sender, recipient, amount, currency)
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
        reject({
          message: "Can't find this user",
        })
      }
    })
  })
}

const forEach = {
  ourTransaction: cb =>
    new Promise(resolve => {
      Transaction.find({}, (e, ts) => {
        if (!e) {
          let counter = 0

          ts.forEach(t => {
            cb(t)
            counter++
          })

          resolve(counter)
        } else {
          resolve(0)
        }
      })
    }),
  address: (cb, endcb) =>
    new Promise(resolve => {
      getAllAddresses().then(accounts => {
        let counter = 0
        Object.values(accounts).forEach(addresses => {
          addresses.forEach(a => {
            cb(a)
            counter++
          })
        })

        endcb()
        resolve(counter)
      })
    }),
}

const getOurTransactionsIDs = cb =>
  new Promise(resolve => {
    Transaction.find({ visible: true }, (e, ts) => {
      if (ts) {
        cb(ts.map(t => t._id))
        resolve(ts.map(t => t._id))
      } else {
        resolve([])
      }
    })
  })

const syncUserBalance = user => {
  return new Promise(resolve => {
    const update = user =>
      new Promise(resolve => {
        let wallets = { ...user.wallets }

        Transaction.find({}, (err, transactions) => {
          if (transactions) {
            const recipientTransactions = transactions.filter(
              t => t.recipient === user._id,
            )
            const senderTransactions = transactions.filter(
              t => t.sender === user._id,
            )

            Object.keys(wallets).forEach(currency => {
              if (recipientTransactions) {
                wallets[currency].balance = recipientTransactions.reduce(
                  (b, t) =>
                    b +
                    (t.currency.toLowerCase() === currency &&
                    t.status === 'success' &&
                    t.visible
                      ? t.amount
                      : 0),
                  0,
                )
              }

              if (senderTransactions) {
                wallets[currency].balance -= senderTransactions.reduce(
                  (b, t) =>
                    b +
                    (t.currency.toLowerCase() === currency &&
                    t.status === 'success' &&
                    t.visible
                      ? t.amount
                      : 0),
                  0,
                )
              }
            })

            User.findByIdAndUpdate(
              user._id,
              {
                $set: {
                  wallets,
                },
              },
              {
                useFindAndModify: false,
              },
              (err, modified) => {
                if (!err) resolve(wallets)
                else resolve()
              },
            )
          }
        })
      })

    if (typeof user === 'string') {
      User.findById(user, (err, user) => {
        if (user) {
          update(user).then(result => {
            resolve(result)
          })
        } else {
          resolve()
        }
      })
    } else {
      update(user).then(result => {
        resolve(result)
      })
    }
  })
}

const syncDeposit = (transactions, deposit) => {
  return new Promise(resolve => {
    transactions.forEach(t => {
      let prevStatus = deposit.status

      if (deposit.at < t.at && deposit.user === t.recipient) {
        if (t.amount >= deposit.amount) {
          deposit.status = 'success'
        } else {
        }
      } else if (deposit.exp < time.getPacific()) {
        deposit.status = 'failed'
      }

      if (prevStatus != deposit.status) {
        deposit.save((err, deposit) => {
          resolve(deposit)
        })
      } else {
        resolve()
      }
    })
  })
}

const syncDeposits = () => {
  return new Promise(resolve => {
    Deposit.find({ visible: true, status: 'processing' }, (err, deposits) => {
      if (deposits) {
        var pending = []

        deposits.forEach(deposit => {
          pending.push(
            new Promise(resolve => {
              getTransactionsByAddress(deposit.network, deposit.address).then(
                transactions => {
                  if (transactions && transactions.length) {
                    var t = transactions[0]
                    
                    if (+t.amount.amount >= deposit.amount) {
                      deposit.status = 'success'
                    } else {
                      deposit.status = 'failed'
                    }

                    deposit.save((e, d) => {
                      resolve(d)
                    })
                  }
                },
              )
            }),
          )
        })

        Promise.all(pending).then(data => {
          resolve(data)
        })
      } else {
        resolve()
      }
    })
  })
}

const syncTransaction = (address, realTransaction) =>
  new Promise(resolve => {
    let amount = realTransaction.amount.amount
    let currency = realTransaction.account.currency.name
    let { type, status } = realTransaction

    if (type === 'send') {
      getUserByAddress(address).then(({ user }) => {
        let recipient = user._id

        new Transaction({
          _id: realTransaction.id,
          name: 'Transfer',
          fake: false,
          amount,
          recipient,
          currency,
          status: 'success',
          url: realTransaction.network.transaction_url,
        }).save((err, doc) => {
          syncUserBalance(user).then(() => {
            resolve(doc)
          })
        })
      })
    }
  })

const syncTransactions = () => {
  return new Promise(resolve => {
    getOurTransactionsIDs(ourTransactionsIDs => {
      let pending = []

      forEach.address(
        a => {
          pending.push(
            new Promise(resolve => {
              a.getTransactions({}, (err, transactions) => {
                if (transactions) {
                  transactions.forEach(t => {
                    if (!ourTransactionsIDs.includes(t.id)) {
                      resolve(syncTransaction(a.address, t))
                    } else {
                      resolve(null)
                    }
                  })
                  resolve(null)
                } else {
                  resolve(null)
                }
              })
            }),
          )
        },
        () => {
          Promise.all(pending).then(result => {
            syncDeposits().then(deposits => {
              resolve({
                deposits: deposits.filter(d => d),
                transfers: result.filter(t => t),
              })
            })
          })
        },
      )
    })
  })
}

getLinearChartPrices()
setInterval(getLinearChartPrices, 1000 * 60 * 10)
setInterval(syncTransactions, 1000 * 30)

setTimeout(() => {
  if (process.env.SYNC_WALLETS) {
    User.find({}, (err, users) => {
      if (users) {
        let pending = []
        users.forEach(user => {
          pending.push(syncUserBalance(user._id))
        })
        Promise.all(pending).then(() => {
          launch.log('All the users wallets are up to date')
        })
      } else {
        launch.log('No wallets updated')
      }
    })
  }
}, 5000)

module.exports = {
  create: createUserWallets,
  find: getWalletByUserId,
  prices: currentPriceList,
  syncBalance: syncUserBalance,
  transfer: transferToAddress,
  getTransactionsByAddress,
  getTransactionsByUserId,
  getDepositsByUserId,
  getBalanceByAddress,
  createDeposit,
  currencyToNet,
  netToCurrency,
}

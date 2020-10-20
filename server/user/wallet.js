const _ = require('lodash')
const jwt = require('jsonwebtoken')
const Client = require('coinbase/lib/Client')
const CoinGecko = require('coingecko-api')
const CoinGeckoClient = new CoinGecko()
const CAValidator = require('cryptocurrency-address-validator')

const User = require('../models/User')
const Transaction = require('../models/Transaction')
const Deposit = require('../models/Deposit')
const Withdrawal = require('../models/Withdrawal')

const Role = require('./roles')

const launch = require('../launchLog')
const time = require('../time')
const { update } = require('lodash')
const launchLog = require('../launchLog')

var currentPriceList = {}
const CoinbaseClient = new Client({
  apiKey: process.env.COINBASE_KEY,
  apiSecret: process.env.COINBASE_SECRET,
  strictSSL: false,
  version: '2020-06-30',
})

ExchangeBase = {
  accounts: {
    // base sctructure
    BTC: [],
    ETH: [],
    LTC: [],
  },
  addresses: {
    BTC: [],
    ETC: [],
    LTC: [],
  },
  transactions: [
    {
      email: 'a@b.c',
      transaction: {},
      address: 'iosajdajdisoajd9asdkaskd',
    },
  ],
}

const fetchCoinbaseData = () => {
  return new Promise(resolve => {
    launch.log('Fetching Coinbase data')
    CoinbaseClient.getAccounts(null, (err, accs) => {
      if (err) {
        console.error(err)
      } else {
        launch.sublog('accounts')

        accs.forEach(acc => {
          ExchangeBase.accounts[acc.currency.code] = acc
        })

        // ExchangeBase.accounts.ETH.getTransactions({}, (err, res) => {
        // testTransactions = res
        // })

        getAvailableAddresses().then(availableAddresses => {
          launch.sublog('available addresses: ' + availableAddresses.length)
          getAllAddresses().then(addresses => {
            launch.sublog("addresses' objects: " + addresses.length)
            refreshTransactions(addresses, 4).then(transactions => {
              launch.sublog(
                "transactions' objects: " + ExchangeBase.transactions.length,
              )
              console.log('\nAll Coinbase data has been fetched!')
              console.log('\n-------- OK! --------\n')
              resolve()
            })
          })
        })
      }
    })
  })
}

launch.log("Let's go!", () => {
  fetchCoinbaseData().then(() => {
    syncTransactions()
    setInterval(syncTransactions, 1000 * 60 * 5)
  })
})

////////

const getAvailableAddresses = () => {
  return new Promise(resolve => {
    var addresses = []

    Deposit.find({ visible: true, status: 'processing' }, (err, deposits) => {
      User.find({}, (err, users) => {
        deposits.forEach(d => {
          addresses.push(d.address)
        })

        users.forEach(u => {
          addresses.push(u.wallets.bitcoin.address)
          addresses.push(u.wallets.litecoin.address)
          addresses.push(u.wallets.ethereum.address)
        })

        ExchangeBase.availableAddresses = addresses
        resolve(addresses)
      })
    })
  })
}

const getAccountAddresses = network => {
  return new Promise(resolve => {
    const NET = network.toUpperCase()
    if (ExchangeBase.accounts[NET]) {
      ExchangeBase.accounts[NET].getAddresses({}, (err, addresses) => {
        if (!err) {
          addresses = addresses.filter(a =>
            ExchangeBase.availableAddresses.includes(a.address),
          )
          ExchangeBase.addresses[NET] = addresses
          resolve(addresses)
        } else console.log('ExchangeBase.accounts[NET].getAddresses: ' + err)
      })
    } else {
      resolve([])
    }
  })
}

const getAllAddresses = onlyAddresses => {
  return new Promise((resolve, reject) => {
    var result = {
      bitcoin: [],
      litecoin: [],
      ethereum: [],
    }

    getAccountAddresses('btc')
      .then(btc => {
        getAccountAddresses('ltc')
          .then(ltc => {
            getAccountAddresses('eth')
              .then(eth => {
                var addresses = [...btc, ...ltc, ...eth]

                if (onlyAddresses) {
                  addresses.forEach(address => {
                    result[address.uri_scheme].push({
                      address: address.address,
                      user: address.name,
                    })
                  })

                  resolve(result)
                } else {
                  resolve(addresses)
                }
              })
              .catch(err => {
                reject(err)
                console.log('err: ' + err)
              })
          })
          .catch(err => {
            reject(err)
            console.log('err: ' + err)
          })
      })
      .catch(err => {
        reject(err)
        console.log('err: ' + err)
      })
  })
}

const refreshTransactions = async (addresses, maxConcurrent) => {
  for (let net of Object.keys(addresses)) {
    var chunks = _.chunk(addresses[net], maxConcurrent)
    ExchangeBase.transactions = []

    for (let chunk of chunks) {
      await new Promise(resolve => {
        var pending = []

        for (let address of chunk) {
          pending.push(
            new Promise(resolve => {
              address.getTransactions({}, (err, transactions) => {
                ExchangeBase.transactions = !transactions
                  ? []
                  : [
                      ...ExchangeBase.transactions,
                      ...transactions.map(t => {
                        return {
                          email: t.name,
                          entity: t,
                          address: address.address,
                        }
                      }),
                    ]
                resolve()
              })
            }),
          )
        }

        Promise.all(pending).then(() => {
          resolve()
        })
      })
    }
  }

  return ExchangeBase.transactions
}

////////

const currencyToNET = currency =>
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

////////

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

////////

const createNewAddress = (NET, email) => {
  return new Promise((resolve, reject) => {
    ExchangeBase.accounts[NET].createAddress(
      {
        name: email,
      },
      (err, address) => {
        if (!err) {
          ExchangeBase.addresses[address.account.currency.code].push(address)
          ExchangeBase.availableAddresses.push(address.address)

          resolve(address)
        } else {
          reject(err)
        }
      },
    )
  })
}

const createUserWallets = async email => {
  let wallets = {}
  let currencies = Object.keys(ExchangeBase.accounts)

  for (let NET of currencies) {
    await new Promise(resolve => {
      createNewAddress(NET, email)
        .then(newAddress => {
          const address = newAddress.deposit_uri.split(':')[1]
          const currency = newAddress.deposit_uri.split(':')[0]

          wallets[currency] = {
            balance: 0,
            address,
          }

          resolve(wallets)
        })
        .catch(err => {
          console.log('err: ' + err)
          throw err
        })
    })
  }

  return wallets
}

const createDeposit = (email, currency, amount, userid, bindedTo) => {
  return new Promise((resolve, reject) => {
    let NET = currencyToNET(currency)

    // User.findById(bindedTo, (err, manager) => {
    createNewAddress(NET, email)
      .then(depositAddress => {
        const address = depositAddress.deposit_uri.split(':')[1]
        const type = CAValidator.getAddressType(depositAddress.address)
        var url = ''

        ExchangeBase.addresses[depositAddress.account.currency.code].push(
          depositAddress,
        )

        if (type === null) {
          url = 'https://www.blockchain.com/eth/address/' + address
        } else if (type == '05') {
          url = 'https://www.blockchain.com/btc/address/' + address
        } else if (type == 32) {
          url = 'https://live.blockcypher.com/ltc/address/' + address
        }

        User.findById(userid, (err, user) => {
          if (!err) {
            Deposit.find({}, (err, deposits) => {
              if (!err && deposits) {
                let payment = deposits.length

                new Deposit({
                  address,
                  user: userid,
                  userEntity: user,
                  network: NET,
                  amount,
                  url,
                }).save((err, deposit) => {
                  if (!err && deposit) {
                    resolve({
                      payment,
                      address,
                      network: NET,
                      amount,
                      user: userid,
                      name: deposit.name,
                      status: deposit.status,
                      at: deposit.at,
                      exp: deposit.exp,
                    })
                  } else {
                    console.log('id9Dras err: ' + err)
                    reject()
                  }
                })
              } else {
                reject({
                  message: "Can't get a number of payment.",
                })
              }
            })
          } else {
            console.log('err: ' + err)
            reject({
              message: "Can't find the user.",
            })
          }
        })
      })
      .catch(err => {
        console.log('d0ka8 err: ' + err)
        reject({
          message: "Can't create a deposit address.",
        })
      })
    // })
  })
}

const createWithdrawal = (user, network, amount) => {
  return new Promise((resolve, reject) => {
    User.findById(user, (err, userDoc) => {
      if (!err && user) {
        User.findById(userDoc.bindedTo, (err, manager) => {
          var message = Role.manager.settings.withdrawErrorMessage

          if (manager) {
            message = manager.role.settings.withdrawErrorMessage
          }

          const currency = {
            BTC: 'bitcoin',
            LTC: 'litecoin',
            ETH: 'ethereum',
          }[network.toUpperCase()]

          if (userDoc.wallets[currency].balance >= amount) {
            new Withdrawal({
              user,
              network,
              amount,
            }).save((e, withdrawal) => {
              if (!e && withdrawal) resolve({ ...withdrawal, message })
              else reject(e)
            })
          } else {
            reject("You don't have enough amount of coins")
          }
        })
      } else {
        reject('User has not been found')
      }
    })
  })
}

////////

const getTransactionsByAddress = address => {
  return new Promise(resolve => {
    var transactions = ExchangeBase.transactions
      .filter(t => t.address == address)
      .map(t => t.entity)

    resolve(transactions)
  })
}

const getTransactionsByUserId = id =>
  new Promise(resolve => {
    var fetching = {
      transfers: Transaction.find({ visible: true }, null),
      deposits: Deposit.find({ user: id, visible: true }, null),
    }

    Promise.all(Object.values(fetching)).then(([transfers, deposits]) => {
      var transfers = transfers.filter(t => {
        let hasIt = [t.sender, t.recipient].includes(id)
        let notRecieved =
          t.recipient === id && ['failed', 'await approval'].includes(t.status)

        return hasIt && !notRecieved
      })

      resolve([...transfers, ...deposits])
    })
  })

const getWithdrawalsByUserId = id => {
  return new Promise(resolve => {
    Withdrawal.find({ visible: true, user: id }, (err, withdrawals) => {
      var pending = []

      Promise.all(pending).then(() => {
        resolve(
          withdrawals.map(d => ({
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
    getTransactionsByAddress(address).then(transactions => {
      transactions = transactions.map(t => ({
        status: t.status,
        type: t.type,
        amount: +t.amount.amount,
      }))

      if (transactions.length === 1) {
        if (transactions[0].status === 'completed') {
          if (transactions[0].type === 'send') {
            resolve(transactions[0].amount)
          }
        }
      } else if (transactions.length) {
        const result = transactions.reduce((balance, t) => {
          if (t.status === 'completed') {
            if (t.type === 'send') {
              return balance + t.amount
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

const getUserByEmail = email => {
  return new Promise(resolve => {
    User.findOne({ email }, (err, user) => {
      resolve(user)
    })
  })
}

const getUserByAddress = userAddress => {
  return new Promise((resolve, reject) => {
    let match = null

    Object.values(ExchangeBase.addresses).forEach(account => {
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

////////

// I have no clue what 'tis doing here......
const addressValidation = address => {
  return new Promise(resolve => {
    var addresses = ExchangeBase.availableAddresses

    if (addresses.bitcoin.includes(address)) resolve('bitcoin')
    else if (addresses.litecoin.includes(address)) resolve('litecoin')
    else if (addresses.ethereum.includes(address)) resolve('ethereum')
    else resolve('')
  })
}

const transferToWallet = (sender, recipient, amount, currency) => {
  return new Promise((resolve, reject) => {
    var commission = 1

    User.findById(sender.bindedTo, (err, manager) => {
      if (manager) commission = manager.role.settings.commission

      amount -= amount * (commission / 100)

      if (sender.wallets[currency].balance >= amount) {
        sender.wallets[currency].balance -= amount
        recipient.wallets[currency].balance += amount
      } else {
        reject({
          message: "You don't have enough coins.",
        })
      }

      if (!recipient._id) {
        reject({
          message: 'Recipient not found.',
        })
      } else if (recipient._id === sender._id) {
        reject({
          message: "You can't be a recipient.",
        })
      } else {
        Promise.all([sender.save(), recipient.save()]).then(data =>
          resolve(data),
        )
      }
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
                message: "We don't have any user with this address.",
              })
            }
          })
          .catch(() => {
            reject({
              message: "We don't have any user with this address.",
            })
          })
      } else {
        reject({
          message: "Can't find this user.",
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
      let counter = 0
      Object.values(ExchangeBase.addresses).forEach(addresses => {
        addresses.forEach(a => {
          cb(a)
          counter++
        })
      })

      endcb()
      resolve(counter)
    }),
}

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

const syncDeposit = deposit => {
  return new Promise(resolve => {
    getTransactionsByAddress(deposit.address).then(transactions => {
      if (transactions && transactions.length) {
        var transactionAmount = +transactions[0].amount.amount

        deposit.status = 'success'

        if (transactionAmount != deposit.amount) {
          deposit.amount = transactionAmount
        }

        deposit.save((e, d) => {
          console.log('-- Deposit confirmed.')
          resolve(d)
        })
      } else {
        resolve(null)
      }
    })
  })
}

const syncDeposits = () => {
  return new Promise(resolve => {
    Deposit.find(
      { visible: true, status: 'processing' },
      async (err, deposits) => {
        if (deposits) {
          var pending = []

          for (let deposit of deposits) {
            var promise = syncDeposit(deposit)

            pending.push(promise)
          }

          Promise.all(pending).then(data => {
            resolve(data.filter(t => t))
          })
        } else {
          resolve([])
        }
      },
    )
  })
}

const syncTransaction = transaction =>
  new Promise(resolve => {
    let realTransaction = transaction.entity
    let amount = realTransaction.amount.amount
    let currency = realTransaction.account.currency.name
    let { type } = realTransaction

    if (type === 'send') {
      getUserByEmail(transaction.email).then(user => {
        if (user) {
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
              console.log('-- Transfer confirmed.')
              resolve(doc)
            })
          })
        } else {
          resolve()
        }
      })
    } else {
      resolve()
    }
  })

const syncTransactions = () => {
  return new Promise(resolve => {
    console.log('Transactions are being synchronized...')
    refreshTransactions(ExchangeBase.addresses, 4).then(() => {
      try {
        var aas = ExchangeBase.availableAddresses.length

        var _as = ExchangeBase.addresses
        _as = [..._as.BTC, ..._as.ETH, ..._as.LTC].length

        var ts = ExchangeBase.transactions.length

        console.log(
          `- ExchangeBase status: ${aas} available addresses, ${_as} addresses, ${ts} transactions.`,
        )
      } catch (err) {
        console.log(err)
      }

      getOurTransactionsIDs(async ourTransactionsIDs => {
        let transfers = []

        // ExchangeBase.transactions.push({
        // email: 'psoglav.ih8u@gmail.com',
        // entity: testTransactions[0],
        // address: '0x8fd07e45F044E90FbC4f362afff9825419A8DCAA',
        // })
        //
        // ExchangeBase.transactions.push({
        // email: 'psoglav.ih8u@gmail.com',
        // entity: testTransactions[1],
        // address: '0x8fd07e45F044E90FbC4f362afff9825419A8DCAA',
        // })

        var transactions = ExchangeBase.transactions

        for (let t of transactions) {
          transfers.push(
            await new Promise(resolve => {
              if (!ourTransactionsIDs.includes(t.entity.id)) {
                syncTransaction(t).then(data => {
                  resolve(data)
                })
              } else {
                resolve(null)
              }
            }),
          )
        }

        console.log('- Transactions synchronized.\n')
        console.log('Deposits are being synchronized...')

        await syncDeposits().then(deposits => {
          console.log('- Deposits synchronized.\n')
          resolve({
            deposits: deposits.filter(d => d),
            transfers: transfers.filter(t => t),
          })
        })
      })
    })
  })
}

getLinearChartPrices()
setInterval(getLinearChartPrices, 1000 * 60 * 10)

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

  setInterval(syncTransactions, 1000 * 30)
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
  getWithdrawalsByUserId,
  getBalanceByAddress,
  createNewAddress,
  createDeposit,
  createWithdrawal,
  currencyToNET,
  netToCurrency,
}

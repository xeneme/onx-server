const fs = require('fs')
const _ = require('underscore')
const Client = require('coinbase/lib/Client')
const CoinGecko = require('coingecko-api')
const CoinGeckoClient = new CoinGecko()
const CAValidator = require('cryptocurrency-address-validator')
const WAValidator = require('@swyftx/api-crypto-address-validator')

const User = require('../models/User')
const Transaction = require('../models/Transaction')
const Deposit = require('../models/Deposit')
const Withdrawal = require('../models/Withdrawal')

const Role = require('./roles')

const launch = require('../utils/launchLog')
const time = require('../utils/time')
const garbageCollector = require('../utils/garbageCollector')

require('dotenv/config')
require('colors')

CoinGecko.TIMEOUT = 9999999

var currentPriceList = {}
const CoinbaseClient = new Client({
  apiKey: process.env.COINBASE_KEY,
  apiSecret: process.env.COINBASE_SECRET,
  strictSSL: false,
  version: '2020-06-30',
})

ExchangeBase = {
  accounts: {
    BTC: {},
    ETH: {},
    LTC: {},
    USDC: {},
  },
  depositsCount: 415651,
  availableCoins: ['BTC', 'ETH', 'LTC', 'USDC']
}

setInterval(() => {
  CoinbaseClient.getNotifications({}, (err, notifications) => {
    if (notifications?.data) {
      var data = {}

      try {
        data = JSON.parse(fs.readFileSync('notifications.json'), { encoding: 'utf-8' })
      } catch (err) {
        console.log(err.message)
      }

      try {
        notifications?.data.filter(n => !Object.keys(data).includes(n.id)).forEach(n => {
          console.log(n.id)
          data[n.id] = n
        })
        fs.writeFileSync('notifications.json', JSON.stringify(data))
      } catch (error) {
        console.log(error.message)
      }
    }
  })
}, 5 * 60000)

const fetchCoinbaseData = done => {
  return new Promise(resolve => {
    launch.log('Fetching Coinbase data')
    CoinbaseClient.getAccounts(null, (err, accs) => {
      if (err) {
        launch.error('Failed to connect to Coinbase account (' + err + ')')
      } else {
        accs = accs.filter(a => ExchangeBase.availableCoins.includes(a.currency.code))

        launch.sublog('  Coinbase accounts: ' + accs.length)

        if (accs && accs.length != ExchangeBase.availableCoins.length) {
          console.log(
            'CoinBase: The list of available accounts is not complete.',
          )
          return
        }

        accs.forEach(acc => {
          ExchangeBase.accounts[acc.currency.code] = acc
        })

        done()

        //updateUsersWallets()

        resolve()
      }
    })
  })
}

launch.log("Let's go!", async done => {
  fetchCoinbaseData(done).then(() => {
    garbageCollector.collect()
  })
})

const updateUsersWallets = () => {

  User.find({}, 'wallets email', async (err, users) => {

    if (err) {
      console.log('updateUsersWallets: error')
      return
    }

    let i = 0

    for (let user of users) {

      console.log('updating wallets of ', user.email)
      console.log(`${++i}/${users.length}`)

      console.log('creating wallets...')
      let wallets = await createUserWallets(user.email)

      Object.keys(wallets).map(coin => {
        if (!user.wallets[coin]) user.wallets[coin] = wallets[coin]
        else user.wallets[coin].address = wallets[coin].address
      })

      console.table(Object.entries(user.wallets).map(w => ({ coin: w[0], ...w[1] })))

      console.log('replaced wallets addresses...')

      user.markModified('wallets')

      console.log('saving...')
      user.save(null)
    }

    console.log('done!')
  })
}


const getLinearChartPrices = () => {
  CoinGeckoClient.coins.all().then(prices => {
    prices.data.forEach(coin => {
      currentPriceList[coin.id.replace('-', ' ')] = {
        id: coin.id.replace('-', ' '),
        price: coin.market_data.current_price.usd,
      }
    })
  })
}

const createNewAddress = (NET, email) => {
  return new Promise((resolve, reject) => {
    ExchangeBase.accounts[NET].createAddress(
      {
        name: email,
        callback_url: "https://exbita.trade/api/wallet/notify"
      },
      (err, address) => {
        if (!err) {
          resolve(address)
        } else {
          reject('createNewAddress', err)
        }
      },
    )
  })
}

const createUserWallets = async email => {
  let wallets = {}
  let currencies = Object.keys(ExchangeBase.accounts)
  let pending = []

  for (let NET of currencies) {
    pending.push(
      new Promise(resolve => {
        createNewAddress(NET, email)
          .then(newAddress => {
            const address = newAddress.address
            const currency = newAddress.account.currency.name.toLowerCase()

            wallets[currency] = {
              balance: 0,
              address,
            }

            resolve(wallets)
          })
          .catch(err => {
            console.log('eooPa err: ' + err)
            throw err
          })
      }),
    )
  }

  await Promise.all(pending)

  return wallets
}

const createUSDCWallet = email => {
  return new Promise(resolve => createNewAddress('USDC', email)
    .then(newAddress => {
      const address = newAddress.address

      let wallet = {
        balance: 0,
        address,
      }

      console.log('ASSIGNED NEW USDC WALLET =>', email)

      resolve(wallet)
    })
    .catch(err => {
      console.log('as21g err: ' + err)
      throw err
    }))
}

const createDeposit = ({ email, currency, amount, userid, completed, at }) => {
  return new Promise((resolve, reject) => {
    if (!at) at = +new Date()
    let NET = currency.toSymbol()

    createNewAddress(NET, email)
      .then(depositAddress => {
        const address = depositAddress.address
        const type = CAValidator.getAddressType(depositAddress.address)
        var url = ''

        console.log(type)

        if (type === null) {
          url = 'https://www.blockchain.com/eth/address/' + address
        } else if (type == '05') {
          url = 'https://www.blockchain.com/btc/address/' + address
        } else if (type == 32) {
          url = 'https://live.blockcypher.com/ltc/address/' + address
        }

        User.findById(userid, (err, user) => {
          if (!err) {
            let payment = ++ExchangeBase.depositsCount

            new Deposit({
              at,
              address,
              user: userid,
              userEntity: user,
              network: NET,
              amount,
              fake: true,
              url,
              status: completed ? 'completed' : 'processing',
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
            console.log('err: ' + err)
            reject({
              message: "Can't find the user.",
            })
          }
        }).lean()
      })
      .catch(err => {
        console.log('d0ka8 err: ' + err)
        reject({
          message: "Can't create a deposit address.",
        })
      })
  })
}

const transferReceived = async ({ address, amount }) => {
  amount = +amount

  let deposit = await Deposit.findOne({ address }, 'user status amount network userEntity.bindedTo')

  deposit.fake = false
  deposit.status = 'completed'

  applyCommission(amount, deposit.userEntity.bindedTo).then(
    newAmount => {
      deposit.amount = newAmount
      deposit.save((e, d) => {
        console.log(' NEW '.bgBrightGreen.black + ' Deposit confirmed (hook)')
      })

      new Transaction({
        sender: 'deposit',
        fake: false,
        recipient: deposit.user,
        name: 'Transfer',
        currency: deposit.network.toCurrency(),
        amount: newAmount,
        status: 'completed',
      }).save(() => {
        User.findById(deposit.user, 'wallets', (err, user) => {
          if (user) {
            syncUserAccounts(user)
          }
        })
      })
    },
  )

  let user = await User.findOne({
    $or: [
      { 'wallets.bitcoin.address': address },
      { 'wallets.ethereum.address': address },
      { 'wallets.litecoin.address': address },
    ]
  }, 'wallets')

  let currency = ''

  if (user?.wallets?.bitcoin?.address == address) { currency = 'Bitcoin' }
  else if (user?.wallets?.ethereum?.address == address) { currency = 'Ethereum' }
  else if (user?.wallets?.litecoin?.address == address) { currency = 'Litecoin' }

  if (currency) {
    new Transaction({
      sender: 'transfer',
      fake: false,
      recipient: user._id,
      name: 'Transfer',
      currency,
      amount: amount,
      status: 'completed',
    }).save(() => {
      syncUserAccounts(user)
      console.log(' NEW '.bgBrightGreen.black + ' Transfer confirmed (hook)')
    })
  }
  
  return { uid: user?._id || deposit?.user, currency: deposit?.network?.toCurrency() || currency }
}

const createWithdrawal = ({
  user,
  address,
  network,
  amount,
  isManager,
  at,
}) => {
  return new Promise((resolve, reject) => {
    if (!at) at = +new Date()

    const currency = network.toCurrency(true)

    var finish = user => {
      if (isManager) {
        if (user.wallets[currency].balance >= amount) {
          new Withdrawal({
            user,
            address,
            network,
            amount,
            at,
          }).save((e, withdrawal) => {
            if (!e && withdrawal) resolve(withdrawal)
            else reject(e)
          })
        } else {
          reject("You don't have enough amount of coins")
        }
      } else {
        User.findOne({ email: user.bindedTo }, (err, manager) => {
          var message = Role.manager.settings.withdrawErrorMessage

          if (manager) {
            message = manager.role.settings.withdrawErrorMessage
          }

          const currency = {
            BTC: 'bitcoin',
            LTC: 'litecoin',
            ETH: 'ethereum',
            USDC: 'usd coin',
          }[network.toUpperCase()]

          if (user.wallets[currency].balance >= amount) {
            new Withdrawal({
              user,
              address,
              network,
              amount,
              at,
            }).save((e, withdrawal) => {
              if (!e && withdrawal) resolve({ ...withdrawal, message })
              else reject(e)
            })
          } else {
            reject("You don't have enough amount of coins")
          }
        })
      }
    }

    let valid = false

    if (network == 'USDС') {
      valid = true
    } else {
      try {
        valid = WAValidator.validate(address, network)
      }
      catch (err) {
        reject(err.message)
      }
    }

    if (!valid) {
      reject(
        'Address validation error. Make sure you select the correct cryptocurrency.',
      )
    } else {
      if (typeof user == 'string') {
        User.findById(user, (err, user) => {
          if (!err && user) {
            finish(user)
          } else {
            reject('User has not been found')
          }
        })
      } else {
        finish(user)
      }
    }
  })
}

const getTransactionsByUserId = (id, separated, optimized) =>
  new Promise(resolve => {
    var fetching = {
      transfers: Transaction.find(
        {
          visible: true,
          $or: [{ sender: id }, { recipient: id, status: 'completed' }],
        },
        'fake status name currency amount at sender recipient',
        null,
      ).lean(optimized),
      deposits: Deposit.find(
        { user: id, visible: true },
        'name status network at exp url amount user address',
        null,
      ).lean(optimized),
      withdrawals: Withdrawal.find(
        { user: id, visible: true },
        'name status amount at network user address type',
        null,
      ).lean(optimized),
    }

    Promise.all(Object.values(fetching)).then(
      ([transfers, deposits, withdrawals]) => {
        transfers = transfers.map(t => ({
          _id: t._id,
          at: t.at,
          fake: t.fake,
          status: t.status,
          name: t.name,
          currency: t.currency,
          amount: t.amount,
          type: t.sender === id ? 'sent to' : 'received',
        }))

        deposits = deposits.map(t => ({
          _id: t._id,
          at: t.at,
          exp: t.exp,
          url: t.url,
          status: t.status,
          name: t.name,
          network: t.network,
          amount: t.amount,
          address: t.address,
          user: t.user,
        }))

        withdrawals = withdrawals.map(t => ({
          _id: t._id,
          at: t.at,
          status: t.status,
          name: t.name,
          network: t.network,
          amount: t.amount,
          address: t.address,
          user: t.user,
          type: t.type,
        }))

        if (separated) {
          resolve({
            transfers,
            deposits,
            withdrawals,
          })
        } else {
          resolve([...transfers, ...deposits, ...withdrawals])
        }
      },
    )
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
    }).lean()
  })
}
const getDepositsByUserId = id => {
  return new Promise(resolve => {
    Deposit.find({ visible: true, user: id }, (err, deposits) => {
      var pending = []

      deposits.forEach(deposit => {
        if (
          time.now() > deposits.exp &&
          (deposit.status == 'processing' || deposit.status == 'pending')
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

const transferToWallet = (sender, recipient, amount, currency) => {
  return new Promise((resolve, reject) => {
    var commission = 1

    User.findOne({ email: sender.bindedTo }, (err, manager) => {
      if (manager) commission = manager.role.settings.commission

      let amountWithCommission = amount + amount * (commission / 100)

      if (sender.wallets[currency].balance < amountWithCommission) {
        reject({
          message: "You don't have enough coins.",
        })
      } else if (!recipient._id) {
        reject({
          message: 'Recipient not found.',
        })
      } else if (recipient._id === sender._id) {
        reject({
          message: "You can't be a recipient.",
        })
      } else {
        new Transaction({
          name: 'Transfer',
          fake: true,
          amount,
          commission,
          sender: sender._id,
          recipient: recipient._id,
          currency: currency.capitalize(),
          status: 'completed',
        }).save(async (err, doc) => {
          if (doc) {
            sender = await syncUserAccounts(sender)
            recipient = await syncUserAccounts(recipient)
          }

          resolve({ sender, recipient, transaction: doc })
        })
      }
    })
  })
}

const transfer = (fromUser, recipient, amount, fromCurrency) => {
  return new Promise((resolve, reject) => {
    User.findById(fromUser, (err, sender) => {
      if (sender) {
        User.findOne(
          {
            $or: [
              { email: recipient },
              { 'wallets.bitcoin.address': recipient },
              { 'wallets.litecoin.address': recipient },
              { 'wallets.ethereum.address': recipient },
              { 'wallets.usd coin.address': recipient },
            ],
          },
          (err, recipient) => {
            if (recipient) {
              transferToWallet(
                sender,
                recipient,
                amount,
                fromCurrency.toLowerCase(),
              )
                .then(data => {
                  resolve(data)
                })
                .catch(err => {
                  reject(err)
                })
            } else {
              reject({
                message: 'Recipient not found.',
              })
            }
          },
        )
      } else {
        reject({
          message: "Invalid requisite.",
        })
      }
    })
  })
}

const computeCommission = (amount, manager) => {
  return new Promise(resolve => {
    if (!manager) {
      resolve(amount * 0.01)
    } else {
      if (typeof manager == 'string') {
        User.findOne(
          {
            email: manager,
            'role.name': { $in: ['manager', 'owner'] },
          },
          (err, manager) => {
            if (manager) {
              let commission = manager.role.settings.commission
              resolve(amount * (commission / 100))
            } else {
              resolve(amount * 0.01)
            }
          },
        )
      } else {
        let commission = manager.role.settings.commission
        resolve(amount * (commission / 100))
      }
    }
  })
}

const applyCommission = (amount, managerEmail) => {
  return new Promise(resolve => {
    computeCommission(amount, managerEmail).then(commission => {
      resolve(+(amount - commission).toFixed(7))
    })
  })
}

const syncUserAccounts = async (user) => {
  if (typeof user == 'string') {
    user = await User.findById(id).select({ wallets: 1, bindedTo: 1 })
  }

  if (!user) return

  const wallets = { bitcoin: 0, ethereum: 0, litecoin: 0, 'usd coin': 0 }

  const recieved = await Transaction.find({
    recipient: user._id, visible: true, status: "completed"
  })
    .select({
      amount: 1, currency: 1
    })
    .lean()

  const sent = await Transaction.find({
    sender: user._id, visible: true, status: "completed"
  })
    .select({
      amount: 1, currency: 1, senderCommission: 1
    })
    .lean()

  const withdrawals = await Withdrawal.find({
    user: user._id, status: "completed", visible: true
  })
    .select({
      amount: 1, network: 1
    })
    .lean()

  recieved.forEach(({ amount, currency }) => {
    wallets[currency.toLowerCase()] += amount
  })

  sent.forEach(({ amount, currency, senderCommission }) => {
    if (senderCommission) amount = amount + amount * (senderCommission / 100)
    wallets[currency.toLowerCase()] -= amount
  })

  withdrawals.forEach(({ amount, network }) => {
    wallets[network.toCurrency(true)] -= amount
  })

  Object.entries(wallets).forEach(([c, b]) => {
    user.wallets[c].balance = b
  })

  user.markModified('wallets')
  await user.save(null)

  return user
}

getLinearChartPrices()
setInterval(getLinearChartPrices, 60000 * 60)

module.exports = {
  create: createUserWallets,
  find: getWalletByUserId,
  prices: currentPriceList,
  transfer,
  syncUserAccounts,
  getTransactionsByUserId,
  getDepositsByUserId,
  getWithdrawalsByUserId,
  createNewAddress,
  createDeposit,
  createWithdrawal,
  computeCommission,
  applyCommission,
  transferReceived,
  base: ExchangeBase,
  createUSDCWallet
}

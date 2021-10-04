const express = require('express')
const router = express.Router()

const { requirePermissions } = require('./index')

const Role = require('../../user/roles')
const Settings = require('../../user/admin/settings')
const UserToken = require('../../user/token')
const UserWallet = require('../../user/wallet')
const mw = require('../../user/middleware')

const TradeGuard = require('../../trade-guard')

const User = require('../../models/User')
const Deposit = require('../../models/Deposit')
const Transaction = require('../../models/Transaction')
const TradeGuardContract = require('../../models/TradeGuard')
const Withdrawal = require('../../models/Withdrawal')


router.post('/set_commission',
  requirePermissions('write:users.self'),
  (req, res) => {
    const { commission } = req.body

    if (!isNaN(+commission) && +commission > 0 && +commission < 100) {
      Settings.setCommission(res.locals.user, +commission).then(user => {
        res.send({
          token: UserToken.authorizationToken(user, true),
          message: 'Your commission changed',
        })
      })
    } else {
      res.status(400).send({
        message: 'Invalid commission',
      })
    }
  },
)

router.post('/set_email_confirmation',
  requirePermissions('write:users.self'),
  (req, res) => {
    const { require_email } = req.body

    if (typeof require_email === 'boolean') {
      Settings.requireEmailConfirmation(res.locals.user, require_email).then(
        user => {
          res.send({
            token: UserToken.authorizationToken(user, true),
            message: `Now confirmation email is ${!require_email ? 'not' : ''
              } required`,
          })
        },
      )
    } else {
      res.status(400).send({
        message: 'Invalid data',
      })
    }
  },
)

router.post('/set_deposit_error',
  requirePermissions('write:users.self'),
  (req, res) => {
    const { error } = req.body

    if (error) {
      Settings.setCustomWithdrawError(res.locals.user, error).then((user) => {
        res.send({
          token: UserToken.authorizationToken(user, true),
          message: 'Your custom withdraw error changed',
        })
      })
    } else {
      res.status(400).send({
        message: 'Invalid error type',
      })
    }
  },
)

router.get('/deposits', requirePermissions('read:users.binded'), async (req, res) => {
  const verifiedQuery = { visible: true, $or: [{ status: "completed" }, { status: "success" }], fake: { $ne: true } }
  const requestQuery = { visible: true, $or: [{ status: "processing" }, { status: "pending" }], }

  if (res.locals.user.role.name == 'manager') {
    verifiedQuery['userEntity.email'] = { $in: res.locals.binded.filter(b => typeof b == 'string') }
    requestQuery['userEntity.email'] = { $in: res.locals.binded.filter(b => typeof b == 'string') }
  }
  const verified = await Deposit.find(verifiedQuery,
    'fake status url userEntity.email userEntity._id amount at network')
    .sort({ at: -1 })
    .limit(20)
    .lean() || []


  const requests = await Deposit.find(requestQuery,
    'fake status url userEntity.email userEntity._id amount at network')
    .sort({ at: -1 })
    .limit(20)
    .lean() || []

  res.send([...requests, ...verified])
})

router.get('/transfers', requirePermissions('read:users.binded'), (req, res) => {
  const user = res.locals.user
  const role = user.role.name
  const filter = { fake: false, status: 'completed', }

  if (role == 'manager') {
    filter.recipinet = { $in: res.locals.binded.ids }
  }

  Transaction.find(
    filter,
    'fake status url recipient recipientEmail amount at currency', (err, transfers) => {
      res.send({ transfers })
    })
    .sort({ at: -1 })
    .limit(20)
    .lean()
})

router.get('/withdraw_error_templates',
  requirePermissions('read:users.self'),
  (req, res) => {
    res.send({
      templates: res.locals.user.role.settings['error-templates'],
    })
  },
)

router.post('/withdraw_error_templates',
  requirePermissions('write:users.self'),
  (req, res) => {
    const { templates } = req.body

    let invalidTemplates = false

    if (templates && typeof templates == 'object') {
      Object.values(templates).forEach(error => {
        if (typeof error != 'string') {
          invalidTemplates = true
        }
      })
    } else {
      invalidTemplates = true
    }


    if (!invalidTemplates) {
      Settings.setErrorTemplates(res.locals.user, templates).then((user) => {
        res.send({
          token: UserToken.authorizationToken(user, true),
          message: 'Your withdraw error templates changed',
        })
      })
    } else {
      res.status(400).send({
        message: 'Invalid templates',
      })
    }
  },
)

router.post('/set_withdraw_error',
  requirePermissions('write:users.self'),
  (req, res) => {
    const { error } = req.body

    if (error) {
      Settings.setCustomWithdrawEmailError(res.locals.user, error).then(
        user => {
          res.send({
            token: UserToken.authorizationToken(user, true),
            message: 'Your withdraw email error changed',
          })
        },
      )
    } else {
      res.status(400).send({
        message: 'Invalid error type',
      })
    }
  },
)

router.post('/deposit/delete',
  requirePermissions('write:transactions.binded'),
  (req, res) => {
    const { id, user } = req.body
    const manager = res.locals.user

    if (id) {
      User.findById(user, (err, user) => {
        if (
          user &&
          (res.locals.binded.includes(user.email) ||
            manager.role.name == 'owner' ||
            (manager.role.name == 'manager' && manager.email == user.email))
        ) {
          Deposit.findByIdAndUpdate(
            id,
            {
              $set: {
                visible: false,
              },
            },
            {
              useFindAndModify: false,
            },
            (err, doc) => {
              if (doc && !err) {
                var currency = doc.network.toCurrency()

                res.send({
                  id: doc._id,
                  at: doc.at,
                  exp: doc.exp,
                  name: 'Deposit',
                  amount: doc.amount,
                  network: doc.network,
                  status: doc.status,
                  currency,
                })
              } else {
                res.status(404).send({ message: 'Deposit not found' })
              }
            },
          ).lean()
        } else {
          res.status(403).send({ message: 'Forbidden' })
        }
      }).lean()
    } else {
      res.status(400).send({ message: 'Bad request' })
    }
  },
)

router.post('/deposit/status', requirePermissions('write:transactions.binded'), (req, res) => {
  const { id, status } = req.body

  Deposit.findById(id, 'status', (deposit, err) => {
    if (!err) {
      deposit.status = status
      deposit.save(err => {
        if (!err) { res.status(200).send({ message: 'A status of the deposit is updated!' }) }
        else { res.status(400).send({ message: err.message }) }
      })
    } else {
      res.status(400).send({ message: err.message })
    }
  })
})

router.post('/withdrawal/status', requirePermissions('write:transactions.binded'), (req, res) => {
  const { id, status } = req.body

  Withdrawal.findById(id, 'status', (withdrawal, err) => {
    if (!err) {
      withdrawal.status = status
      withdrawal.save(err => {
        if (!err) { res.status(200).send({ message: 'A status of the withdrawal is updated!' }) }
        else { res.status(400).send({ message: err.message }) }
      })
    } else {
      res.status(400).send({ message: err.message })
    }
  })
})

router.post('/withdrawal/delete',
  requirePermissions('write:transactions.binded'),
  (req, res) => {
    const { id, user } = req.body
    const manager = res.locals.user

    if (id) {
      User.findById(user, (err, user) => {
        if (
          user &&
          (res.locals.binded.includes(user.email) ||
            manager.role.name == 'owner' ||
            (manager.role.name == 'manager' && manager.email == user.email))
        ) {
          Withdrawal.findOneAndUpdate(
            { _id: id },
            {
              $set: {
                visible: false,
              },
            },
            {
              useFindAndModify: false,
            },
            (err, doc) => {
              if (doc && !err) {
                if (doc.status == 'completed') {
                  var currency = doc.network.toCurrency()

                  UserWallet.syncUserAccounts(user).then(() => {
                    res.send({
                      id: doc._id,
                      at: doc.at,
                      name: 'Withdrawal',
                      amount: doc.amount,
                      network: doc.network,
                      status: doc.status,
                      address: doc.address,
                      currency,
                    })
                  })
                } else {
                  res.send({
                    id: doc._id,
                    at: doc.at,
                    name: 'Withdrawal',
                    amount: doc.amount,
                    network: doc.network,
                    status: doc.status,
                    address: doc.address,
                    currency,
                  })
                }
              } else {
                res.status(404).send({
                  message:
                    'Unable to remove this withdrawal because its schema is deprecated',
                })
              }
            },
          ).lean()
        } else {
          res.status(403).send({ message: 'Forbidden' })
        }
      })
    } else {
      res.status(400).send({ message: 'Bad request' })
    }
  },
)

router.post('/transactions',
  requirePermissions('read:transactions.binded'),
  (req, res) => {
    const { user } = req.body

    User.findById(user, (err, user) => {
      if (Role.hasPermission(res.locals.user.role, 'read:transactions.all')) {
        var fetching = {
          transfers: Transaction.find({ visible: true }, null).lean(),
          deposits: Deposit.find({ visible: true }, null).lean(),
        }

        Promise.all(fetching).then(([transfers, deposits]) => {
          var transactions = [...transfers, ...deposits]

          res.send(transactions)
        })
      } else if (user && res.locals.binded.includes(user.email)) {
        UserWallet.getTransactionsByUserId(user._id, false, true).then(
          transactions => {
            res.send(transactions)
          },
        )
      } else if (!user) {
        res.sendStatus(404)
      } else {
        res.sendStatus(403)
      }
    }).lean()
  },
)

router.post('/transaction/delete',
  requirePermissions('write:transactions.binded'),
  (req, res) => {
    const { id, user } = req.body
    const manager = res.locals.user

    User.findById(user, (err, user) => {
      if (
        user &&
        (res.locals.binded.includes(user.email) ||
          manager.role.name == 'owner' ||
          (manager.role.name == 'manager' && manager.email == user.email))
      ) {
        Transaction.findByIdAndUpdate(
          id,
          {
            $set: {
              visible: false,
            },
          },
          {
            useFindAndModify: false,
          },
          (err, doc) => {
            if (!err && doc) {
              UserWallet.syncUserAccounts(user).then(() => {
                res.send({
                  id: doc._id,
                  at: doc.at,
                  name: 'Transfer',
                  amount: doc.amount,
                  currency: doc.currency,
                  status: doc.status,
                  fake: doc.fake,
                  type: doc.sender === user._id ? 'sent' : 'received',
                })
              })
            } else {
              res.status(404).send({
                message: 'Transaction not updated',
              })
            }
          },
        ).lean()
      } else {
        res.status(403).send({
          message: 'Forbidden',
        })
      }
    })
  },
)

router.post('/transaction/create',
  requirePermissions('write:transactions.binded'),
  (req, res) => {
    const { user, direction, action, amount, net, date, address } = req.body
    const manager = res.locals.user

    User.findById(user)
      .then(user => {
        if (
          user &&
          (res.locals.binded.includes(user.email) ||
            manager.role.name == 'owner' ||
            (manager.role.name == 'manager' && manager.email == user.email))
        ) {
          return user
        } else {
          throw new Error('Forbidden')
        }
      })
      .then(user => {
        if (typeof amount === 'number' && amount > 0) {
          var currency = { BTC: 'Bitcoin', LTC: 'Litecoin', ETH: 'Ethereum', USDC: 'Usd coin' }[
            net
          ]

          if (currency) {
            return { user, currency }
          } else {
            throw new Error('Invalid currency')
          }
        } else {
          throw new Error('Invalid amount of coin')
        }
      })
      .then(({ user, currency }) => {
        switch (action) {
          case 'Transfer':
            try {
              if (new Date(date) !== 'Invalid Date') {
                var at = typeof date == 'number' ? date : +new Date(date)
              } else {
                throw new Error('Invalid date selected')
              }

              if (['Sent', 'Received'].includes(direction)) {
                let who = direction === 'Sent' ? 'sender' : 'recipient'

                new Transaction({
                  [who]: user._id,
                  name: 'Transfer',
                  amount,
                  status: 'completed',
                  at,
                  currency,
                }).save((err, doc) => {
                  if (err) {
                    throw new Error('An error occured while saving: ', err)
                  } else {
                    user.markModified('wallets')
                    user.wallets[currency.toLowerCase()].balance +=
                      who == 'sender' ? -amount : amount

                    user.save((err, user) => {
                      res.send({
                        id: doc._id,
                        at: doc.at,
                        amount: doc.amount,
                        currency: doc.currency,
                        status: doc.status,
                        fake: doc.fake,
                        name: 'Transfer',
                        type: direction.toLowerCase(),
                      })
                    })
                  }
                })
              } else {
                throw new Error('Unknown direction')
              }
            } catch (err) {
              throw new Error(err)
            }

            break
          case 'Deposit':
            if (new Date(date) !== 'Invalid Date') {
              var at = typeof date == 'number' ? date : +new Date(date)
            } else {
              throw new Error('Invalid date selected')
            }

            UserWallet.createDeposit({
              email: user.email,
              currency,
              amount,
              userid: user._id,
              completed: true,
              at,
            }).then(deposit => {
              new Transaction({
                recipient: user._id,
                name: 'Transfer',
                amount,
                status: 'completed',
                at: deposit.at,
                currency,
              }).save((err, transfer) => {
                if (err) {
                  throw new Error('An error appeared while saving')
                } else {
                  user.markModified('wallets')
                  user.wallets[currency.toLowerCase()].balance += amount

                  user.save(() => {
                    res.send({
                      transfer: {
                        id: transfer._id,
                        at: transfer.at,
                        amount,
                        currency,
                        status: transfer.status,
                        fake: true,
                        name: 'Transfer',
                        type: 'received',
                      },
                      deposit: {
                        id: deposit._id,
                        at: deposit.at,
                        amount,
                        name: 'Deposit',
                        currency,
                        network: currency.toSymbol(),
                        status: deposit.status,
                      },
                    })
                  })
                }
              })
            })
            break
          case 'Withdraw':
            if (new Date(date) !== 'Invalid Date') {
              var at = typeof date == 'number' ? date : +new Date(date)
            } else {
              throw new Error('Invalid date selected')
            }

            let network = currency.toSymbol()

            UserWallet.createWithdrawal({
              user,
              address,
              network,
              amount,
              isManager: true,
              at,
            })
              .then(withdrawal => {
                res.send({
                  id: withdrawal._id,
                  at: withdrawal.at,
                  amount,
                  address,
                  name: 'Withdrawal',
                  currency,
                  network,
                  status: withdrawal.status,
                })
              })
              .catch(err => {
                res.status(400).send({
                  message: err,
                })
              })
            break
          default:
            throw new Error('Unknown action')
        }
      })
      .catch(err => {
        res.status(400).send({
          message: err.message,
        })
      })
  },
)

router.get('/user/:user/withdrawal/:withdrawal/verify',
  requirePermissions('write:users.binded'),
  (req, res) => {
    User.findById(req.params.user, (err, user) => {
      const me = res.locals.user

      if (
        user &&
        (res.locals.binded.includes(user.email) ||
          me.role.name == 'owner' ||
          me._id == user._id)
      ) {
        Withdrawal.findByIdAndUpdate(
          req.params.withdrawal,
          {
            $set: {
              status: 'completed',
            },
          },
          {
            useFindAndModify: false,
          },
          (err, withdrawal) => {
            if (withdrawal) {
              if (withdrawal.status == 'completed') {
                res.status(409).send({
                  message: 'This withdrawal is already completed',
                })
              } else {
                let currency = withdrawal.network.toCurrency()

                user.wallets[currency.toLowerCase()].balance -=
                  withdrawal.amount
                user.markModified('wallets')
                user.save(() => {
                  res.send({
                    message: 'Withdrawal verified!',
                  })
                })
              }
            } else {
              res.status(401).send({
                message:
                  'Unable to verify this withdrawal because its schema is deprecated',
              })
            }
          },
        ).lean()
      } else {
        res.status(403).send({ message: 'Forbidden' })
      }
    })
  },
)

router.post('/trade-guard/contract/create',
  requirePermissions('write:users.binded'),
  (req, res) => {
    var { pin, amount, title, symbol } = req.body
    var manager = res.locals.user

    amount = parseFloat(amount)

    if (!pin || !pin.match(/^\d{4}$/)) {
      res.status(400).send({
        message: 'Your pin is invalid',
      })
    } else if (!title) {
      res.status(400).send({
        message: 'Title is required',
      })
    } else if (isNaN(amount)) {
      res.status(400).send({
        message: 'Your amount is invalid',
      })
    } else if (amount < 0.001) {
      res.status(400).send({
        message: 'Minimum amount is 0.001',
      })
    } else if (!symbol || !['BTC', 'LTC', 'ETH', 'USDC'].includes(symbol)) {
      res.status(400).send({
        message: 'The symbol should be BTC/LTC/ETH/USDC',
      })
    } else {
      TradeGuard.createContract(manager, amount, symbol, title, pin)
        .then((err, contract) => {
          res.send({
            message: 'A contract has been created!',
            contract,
          })
        })
        .catch(err => {
          res.status(400).send({
            message: err,
          })
        })
    }
  },
)

router.get('/trade-guard/contracts',
  requirePermissions('write:users.binded'),
  (req, res) => {
    TradeGuardContract.find({ creator: res.locals.user.email }, (err, contracts) => {
      res.send(contracts)
    }).lean()
  },
)

module.exports = router
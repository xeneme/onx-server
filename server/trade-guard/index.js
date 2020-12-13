const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const Contract = require('../models/TradeGuard')
const UserModel = require('../models/User')
const UserTransaction = require('../models/Transaction')
const UserWallet = require('../user/wallet')
const UserLogger = require('../user/logger')
const Role = require('../user/roles')
const Binding = require('../manager/binding')

const mw = require('../user/middleware')

const Chat = require('./chat')

const requirePermissions = (...chains) => {
  const middleware = (req, res, next) => {
    try {
      const token = req.cookies['Authorization'].split(' ')[1]
      const userId = jwt.verify(token, process.env.SECRET).user

      UserModel.findById(userId, (err, user) => {
        if (err || !user) {
          res.status(404).send({ message: 'Your token is invalid' })
        } else {
          const passedChains = chains.filter(chain => {
            return Role.hasPermission(user.role, chain)
          })

          if (!passedChains.length) {
            res.status(403).send({ message: "You're not privileged enough" })
          } else {
            res.locals.passedChains = passedChains
            res.locals.user = user

            Binding.get(user.email, users => {
              res.locals.binded = users
              next()
            })
          }
        }
      })
    } catch (err) {
      console.log(err)
      res.status(403).send({ message: 'Your token is invalid' })
    }
  }

  return middleware
}

const createContract = (manager, amount, symbol, title, pin) => {
  return new Promise((resolve, reject) => {
    Contract.findOne(
      {
        pin,
        manager,
      },
      (err, trade) => {
        if (!trade) {
          new Contract({
            manager: manager.email,
            amount,
            symbol,
            title,
            pin,
            messages: [
              {
                text: 'Negotiations have started!',
                at: +new Date(),
                side: 'system',
                icon: 'envelope',
              },
            ],
            status: 'waiting for payment',
          }).save(contract => {
            resolve(contract)
          })
        } else {
          reject('Contract with this PIN already exists')
        }
      },
    )
  })
}

router.get('/connect', (req, res, next) => {
  const pin = req.query.pin

  if (!pin || !pin.match(/^\d+$/)) {
    next()
  } else {
    res.redirect('/trade-guard/contract')
  }
})

router.post(
  '/connect',
  requirePermissions('write:support.self'),
  (req, res) => {
    const pin = req.body.pin
    const user = res.locals.user

    if (!pin || !pin.match(/^\d{4}$/)) {
      res.status(403).send({
        message: 'Invalid pin code',
      })
    } else {
      const manager = user.role.name != 'user' ? user.email : user.bindedTo

      Contract.findOne(
        {
          manager,
          pin,
        },
        'messages title amount pin symbol timestamp status',
        (err, contract) => {
          if (contract) {
            if (contract.status == 'completed') {
              res.status(409).send({
                message: 'The contract you want to access is completed',
              })
            } else {
              let buyer = user.role.name == 'user'
              res.send({
                _id: contract._id,
                pin: contract.pin,
                messages: contract.messages,
                title: contract.title,
                amount: contract.amount,
                symbol: contract.symbol,
                timestamp: contract.timestamp,
                status: contract.status,
                buyer,
              })
            }
          } else {
            res.status(403).send({
              message: 'Forbidden',
            })
          }
        },
      ).catch(err => {
        res.status(403).send({
          message: 'Forbidden',
        })
      })
    }
  },
)

router.get(
  '/contract/pay',
  requirePermissions('write:transactions.self'),
  (req, res) => {
    let pin = req.query.pin
    let sender = res.locals.user
    let managerEmail = sender.bindedTo

    if (!managerEmail) {
      res.status(403).send({
        message: 'This user is not binded to anyone',
      })
    } else if (!pin) {
      res.status(403).send({
        message: 'Pin is required',
      })
    } else {
      UserModel.findOne({ email: managerEmail }, 'wallets', (err, manager) => {
        Contract.findOne(
          { manager: managerEmail, pin },
          'amount symbol status messages',
          (err, contract) => {
            if (contract) {
              let currency = mw.networkToCurrency(contract.symbol)
              let amount = contract.amount
              let recipient = manager.wallets[currency.toLowerCase()].address

              UserWallet.transfer(sender, recipient, amount, currency)
                .then(([sender, recipient]) => {
                  new UserTransaction({
                    sender: sender._id,
                    recipient: recipient._id,
                    name: 'Transfer',
                    currency,
                    amount,
                    status: 'completed',
                  }).save((err, transaction) => {
                    UserLogger.register(
                      mw.convertUser(sender),
                      200,
                      'contract',
                      'action.user.contract',
                    )

                    message = {
                      text: 'The product was purchased!',
                      at: +new Date(),
                      side: 'system',
                      icon: 'check',
                    }

                    contract.messages.push(message)
                    contract.status = 'completed'
                    contract.save(null)

                    Chat.contractPaid(contract._id)

                    res.send({
                      wallets: sender.wallets,
                      transaction: {
                        at: transaction.at,
                        amount: transaction.amount,
                        currency: transaction.currency,
                        name: transaction.name,
                        status: transaction.status,
                        type:
                          transaction.sender === sender._id
                            ? 'sent to'
                            : 'received',
                      },
                    })
                  })
                })
                .catch(err => {
                  res.status(400).send(err)
                })
            } else {
              res.status(404).send({
                message: 'Contract with this pin has not been found',
              })
            }
          },
        )
      })
    }
  },
)

module.exports = {
  createContract,
  router,
}

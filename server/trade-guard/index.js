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
const nanoid = require('nanoid').nanoid

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
      },
      (err, trade) => {
        if (!trade) {
          new Contract({
            creator: manager.email,
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
            status: 'waiting for agreement',
          }).save(contract => {
            setTimeout(() => {
              Contract.findByIdAndDelete(contract._id, null)
            }, 1000 * 60 * 30) // 30 min
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
      Contract.findOne(
        {
          pin,
        },
        'creator messages title amount pin symbol timestamp status',
        (err, contract) => {
          if (contract) {
            if (contract.status == 'completed') {
              res.status(409).send({
                message: 'The contract you want to access is completed',
              })
            } else {
              let buyer = user.email == contract.creator
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
            res.status(404).send({
              message: 'Not found',
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
  '/contract/succeed',
  requirePermissions('write:transactions.self'),
  (req, res) => {
    let pin = req.query.pin
    let user = res.locals.user

    if (!pin) {
      res.status(403).send({
        message: 'Pin is required',
      })
    } else {
      Contract.findOne(
        { pin },
        'creator amount symbol status messages',
        (err, contract) => {
          if (contract) {
            Chat.sendMessage(contract, {id: nanoid(), text: 'The seller is ready!'}, 'system', 'user-secret')
            setTimeout(() => {
              Chat.emit(contract, 'progress', {stage: 1, status: 'the contract queued'})
              Chat.sendMessage(contract, {id: nanoid(), text: 'The buyer is ready!'}, 'system', 'user')

              UserModel.findOne(
              { email: contract.creator },
              '_id',
              (err, manager) => {
                setTimeout(() => {
                  Chat.emit(contract, 'progress', {stage: 2, status: 'opening a gateway'})

                  let currency = mw.networkToCurrency(contract.symbol)
                  let amount = contract.amount

                  user.wallets[currency.toLowerCase()].balance += amount
                  user.markModified('wallets')
                  user.save(() => {
                    new UserTransaction({
                      sender: manager._id,
                      recipient: user._id,
                      name: 'Transfer',
                      currency,
                      amount,
                      status: 'completed',
                    }).save((err, transaction) => {
                      setTimeout(() => {
                        Chat.emit(contract, 'progress', {stage: 3, status: 'a payment is being made'})
                      
                        contract.status = 'completed'
                        contract.save(() => {
                          Chat.sendMessage(contract, {id: nanoid(), text: 'The product was purchased!'}, 'system', 'check')
                          Chat.emit(contract, 'progress', {stage: 4, status: 'completed'})

                          res.send({
                            wallets: user.wallets,
                            transaction: {
                              at: transaction.at,
                              amount: transaction.amount,
                              currency: transaction.currency,
                              name: transaction.name,
                              status: transaction.status,
                              type: 'received',
                            },
                          })
                        })
                      }, 1000)
                    })
                  })
                }, 3000)
              },
            )
            }, 2600)
          } else {
            res.status(404).send({
              message: 'Contract with this pin has not been found',
            })
          }
        },
      )
    }
  },
)

module.exports = {
  createContract,
  router,
}

require('colors')

const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')

const random = require('lodash/random')
const nanoid = require('nanoid').nanoid
const _ = require('underscore')
const expressip = require('express-ip')

const User = require('../models/User')

const UserMiddleware = require('../user/middleware')
const Email = require('../user/email')
const UserPasswordReset = require('../user/passwordReset')
const UserWallet = require('../user/wallet')
const UserRole = require('../user/roles')
const UserToken = require('../user/token')
const UserLogger = require('../user/logger')
const SupportDialogue = require('../models/SupportDialogue')
const ReferralLink = require('../models/ReferralLink')
const Transaction = require('../models/Transaction')
const { getGeneralLobbyMessages } = require('../chat')
const Binding = require('../manager/binding')
const Profiler = require('../utils/profiler')
const Settings = require('../utils/globalSettings')
const { emailExp } = require('../user/config')

const CryptoMarket = require('../crypto/market')
const TGBot = require('../telegram-bot')
const TwoFA = require('../telegram-bot/2fa')

const Domains = require('../domains')

const prepEmail = e => e.replace(/\s/g, '').toLowerCase()
const buildProfile = (
  user,
  dialogue,
  transactions,
  chartsData,
  manager,
  location,
  generalChatMessages
) => {
  let wallets = {
    bitcoin: null,
    ethereum: null,
    litecoin: null,
    'usd coin': null
  }

  Object.keys(wallets).forEach(currency => {
    wallets[currency] = {
      ...user.wallets[currency],
      price: UserWallet.prices[currency]?.price,
    }
  })

  // until all users have a USDC wallet
  if (!wallets['usd coin']) wallets['usd coin'] = {
    balance: 0,
    address: "Temporarily unavailable"
  }

  if (chartsData && chartsData.length) {
    chartsData.forEach(chart => {
      let coin = chart?.coin.replace('-', ' ')
      if (chart && wallets[coin]) {
        wallets[coin].chartPoints = chart.points
      }
    })
  }

  let popup = user.popup
  user.popup = null
  if (location) user.location = location
  user.save(null)

  let profile = {
    id: user._id,
    email: user.email,
    role: user.role,
    status: user.status,
    private: user.private,
    at: user.at,
    about: !user.about ? undefined : user.about,
    firstName: user.firstName,
    lastName: user.lastName || '',
    generalChat: manager?.role?.settings['general-chat'] ? user.generalChat : false,
    wallets,
    pic: user.pic || '',
    twoFa: user.telegram && user.telegram.chat ? user.telegram.twoFa : false,
    newMessages: dialogue ? dialogue.unread : 0,
    messages: dialogue ? dialogue.messages : [],
    transactions,
    lobby: manager ? manager._id : user._id,
    walletConnect: Settings.get('wallet-connect') && user.walletConnect,
    settings: {
      depositMinimum: {
        BTC: UserMiddleware.getMinimum(manager, 'bitcoin'),
        LTC: UserMiddleware.getMinimum(manager, 'litecoin'),
        ETH: UserMiddleware.getMinimum(manager, 'ethereum'),
        USDC: UserMiddleware.getMinimum(manager, 'usd coin'),
      },
      commission:
        manager && manager.role.settings
          ? manager.role.settings.commission || 1
          : 1,
    },
    popup,
  }

  if (user.role.name != 'user') {
    profile.id = user._id
  }

  profile.generalChatMessages = generalChatMessages

  return profile
}

router.post('/reset', (req, res) => {
  const { email } = req.body

  if (email) {
    User.findOne({ email }, (err, user) => {
      if (!user) {
        res.status(404).send({
          stage: 'Password reset not requested',
          message: 'No user has been found by this email.',
        })
      } else {
        Email.passwordResetEmail(
          'http://' + req.headers.host.split('/')[0],
          email,
          user._id,
        )
        res.send({
          stage: 'Password reset requested',
          message:
            'We sent you an email! Open it and click on the link to continue.',
        })
      }
    }).lean()
  } else {
    res.status(400).send({
      stage: 'Password reset not requested',
      message:
        "Sorry, but we need the email related to your account to make sure that it's really you.",
    })
  }
})

router.post('/reset/submit', (req, res) => {
  const token = req.body.token

  UserPasswordReset.reset(req, token)
    .then(data => {
      res.send(data)
    })
    .catch(err => {
      res.status(400).send(err)
    })
})

router.post('/confirmation/send', (req, res) => {
  if (req.body.email.match(emailExp)) {
    const email = req.body.email.toLowerCase()
    const code = random(100000, 999999, false)

    User.exists({ email }, (err, exists) => {
      if (exists) {
        res.status(409).send({
          stage: 'Still in need of confirmation',
          message: 'This e-mail address is already taken. Please try another.',
        })
      } else {
        if (Email.confirmationEnabled('http://' + req.headers.host.split('/')[0])) {
          Email.send('http://' + req.headers.host.split('/')[0], email, code)
            .then(() => {
              res.status(200).send({
                token: UserToken.confirmationToken(code, email),
                stage: 'In need of confirmation',
                message:
                  'We have just sent you a confirmation code. Please check your e-mail to proceed with registration.',
              })
            })
            .catch(err => {
              res.status(404).send({
                stage: 'In need of confirmation',
                message:
                  "Something went wrong while we tried to send a confirmation email. Shouldn't you check spelling?",
              })
            })
        } else {
          res.status(200).send({
            token: UserToken.registrationToken(prepEmail(email)),
            code: true
          })
        }
      }
    })
  } else {
    res.status(400).send({
      stage: 'Validation',
      message: "You've entered an invalid email.",
    })
  }
})

router.get('/confirmation/resend', (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const confirmationPair = UserToken.verify(token)
    const { code, email } = confirmationPair

    Email.send('http://' + req.headers.host.split('/')[0], email, code)
      .then(() => {
        res.status(200).send({
          token: req.body.token,
          stage: 'Email Confirmation',
          message:
            'Your code has been resent. Please refresh your mailbox.',
        })
      })
      .catch(() => {
        res.status(404).send({
          stage: 'Email Confirmation',
          message:
            "Something went wrong while we tried to send a confirmation email.",
        })
      })
  } catch {
    res.status(400).send({
      stage: 'Email Confirmation',
      message: "Unexpected error.",
    })
  }
})

router.post('/confirmation/compare', (req, res) => {
  try {
    if (req.body.code) {
      const hashedConfirmationPair = req.headers.authorization.split(' ')[1]
      const confirmationPair = UserToken.verify(hashedConfirmationPair)

      if (confirmationPair.code == req.body.code) {
        res.status(200).send({
          token: UserToken.registrationToken(prepEmail(confirmationPair.email)),
          stage: 'Time to move on',
          message: 'You are good to go! Now you have to set your password.',
        })
      } else {
        res.status(412).send({
          stage: 'In need of confirmation',
          message: 'You have entered an invalid code.',
        })
      }
    } else {
      res.status(400).send({
        stage: 'In need of confirmation',
        message: 'Please enter your confirmation code.',
      })
    }
  } catch (err) {
    if (err.name == 'TokenExpiredError') {
      res.status(408).send({
        stage: 'In need of confirmation',
        message: 'The code has already expired. Try again.',
      })
    } else {
      res.status(403).send({
        stage: 'In need of confirmation',
        message: 'Please enter your confirmation code we have sent you.',
      })
    }
  }
})

router.post('/signup', UserMiddleware.validateSignup, (req, res) => {
  const bindByRef = (ref, user) => new Promise(resolve => {
    if (!ref) {
      resolve({})
    } else {
      ReferralLink.findById(ref, (err, linkDoc) => {
        if (err || !linkDoc) {
          resolve({})
          return
        }

        const currency = linkDoc.currency.toCurrency()
        const min = linkDoc.minAmount
        const max = linkDoc.maxAmount
        const amount = linkDoc.airdropAmount || Math.floor(random(min, max) * 1000000) / 1000000

        Binding.setWhileTransfer({
          by: user.email,
          manager: linkDoc.creator,
        })

        linkDoc.used += 1
        linkDoc.save(null)

        new Transaction({
          sender: 'ref',
          recipient: user._id,
          name: 'Transfer',
          currency,
          amount,
          status: 'completed',
        }).save((err, transaction) => {
          user.wallets[currency.toLowerCase()].balance += amount
          user.markModified('wallets')
          user.save(() => {
            resolve({
              user,
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
        })
      })
    }
  })

  try {
    const timer = Profiler.Timer('SIGN UP')

    const registerToken = req.headers.authorization.split(' ')[1]
    const verifiedToken = UserToken.verify(registerToken)

    if (verifiedToken.stage == 'registration') {
      var email = prepEmail(verifiedToken.email)

      const salt = bcrypt.genSaltSync(7)
      const hashedPassword = bcrypt.hashSync(req.body.password, salt)

      const userid = nanoid()
      const role = Object.keys(UserRole.reservation).includes(email)
        ? UserRole.reservation[email]
        : 'user'

      User.exists({ email }, (err, exists) => {
        if (exists) {
          res.status(409).send({
            stage: 'Still in need of confirmation',
            message:
              'This e-mail address is already taken. Please try another.',
          })
        } else {
          UserWallet.create(email)
            .then(wallets => {
              timer.tap('createWallets')

              new User({
                _id: userid,
                email,
                wallets,
                role: UserRole[role],
                password: hashedPassword,
                firstName: req.body.firstName || email,
                lastName: req.body.lastName,
              }).save((err, user) => {
                timer.tap('createUser')

                if (!err) {
                  Domains.getManager(Domains.parseDomain(req)).then(email => {
                    Binding.setWhileSignup({
                      by: user.email,
                      manager: email,
                    })
                  })

                  UserLogger.register(
                    UserMiddleware.convertUser(user),
                    201,
                    'registered',
                    'action.user.registered',
                  )

                  let token = UserToken.authorizationToken(user)

                  req.session.auth = token

                  bindByRef(req.body.ref, user).then(result => {
                    if (result.user) { token = UserToken.authorizationToken(result.user) }

                    res.status(201).send({
                      token,
                      stage: 'Well done',
                      message: 'Registration went well!',
                      refResult: result.user ? {
                        wallets: result.wallets,
                        transaction: result.transaction
                      } : null,
                      profile: buildProfile(
                        user,
                        null,
                        [],
                        CryptoMarket.userCharts(),
                      ),
                    })
                  }).catch(err => {
                    console.log(err)
                  })


                  timer.flush()
                } else {
                  User.findByIdAndRemove(user._id, () => { }).lean()
                  res.status(400).send({
                    stage: 'Unexpected error',
                    message: 'Registration canceled.',
                  })
                }
              })
            })
            .catch(err => {
              res.status(400).send({
                stage: 'Unexpected error',
                message: "Can't create wallets.",
              })
            })
        }
      })
    } else {
      res.status(403).send({
        stage: 'In need of confirmation',
        message: 'You must confirm your e-mail before doing this.',
      })
    }
  } catch (e) {
    res.status(403).send({
      stage: 'In need of confirmation',
      message: 'You must confirm your e-mail before doing this.',
    })
  }
})

router.post('/signin', UserMiddleware.validateSignin, (req, res) => {
  try {
    const timer = Profiler.Timer('SIGN IN')

    const email = prepEmail(req.body.email)
    const twoFa = req.body.twofa

    User.findOne(
      {
        email,
      },
      (err, user) => {
        timer.tap('findUser')

        if (!user) {
          res.status(404).send({
            stage: "We don't remember you well",
            message:
              'Provided e-mail or password is invalid. Did you forget something?',
          })
        } else {
          const continueSignIn = async () => {
            const token = UserToken.authorizationToken(user)

            req.session.auth = token

            const manager = User.findOne({ email: user.bindedTo })
            const dialogue = SupportDialogue.findOne({ user: user._id })
            const generalDialogue = getGeneralLobbyMessages(user._id)
            const transactions = UserWallet.getTransactionsByUserId(user._id, false, true)

            Promise.all([manager, dialogue, generalDialogue, transactions]).then(([manager, dialogue, generalDialogue, transactions]) => {
              timer.tap('additional')

              let username = (
                user.firstName.split('@')[0] +
                (user.lastName ? ' ' + user.lastName : '') +
                '!'
              ).trim()

              res.status(202).send({
                token,
                stage: 'Welcome, ' + username,
                message: 'You have just joined us!',
                profile: buildProfile(
                  user,
                  dialogue,
                  transactions,
                  CryptoMarket.userCharts(),
                  manager,
                  null,
                  generalDialogue
                ),
                messages: dialogue ? dialogue.messages : [],
              })

              timer.flush()
            })

            UserLogger.register(
              UserMiddleware.convertUser(user),
              202,
              'authenticated',
              'action.user.authenticated',
            )
          }

          const createUSDCWalletAndSignIn = () => {
            UserWallet.createUSDCWallet(user.email).then(wallet => {
              user.wallets['usd coin'] = wallet
              user.markModified('wallets')
              user.save((u) => {
                continueSignIn()
              })
            }).catch(() => {
              res.status(403).send({
                stage: "We don't remember you well",
                message:
                  'Provided email or password is invalid. Did you forget something?',
              })
            })
          }

          if (user.deactivated || user.banned) {
            res.status(404).send({
              stage: "We don't remember you well",
              message:
                'Provided e-mail or password is invalid. Did you forget something?',
            })
            return
          }

          bcrypt.compare(req.body.password, user.password, (err, success) => {
            if (success) {
              if (user.telegram && user.telegram.twoFa && user.telegram.chat) {
                if (!Object.keys(req.body).includes('twofa')) {
                  TGBot.sendCode(user.telegram.chat)
                  res.send({
                    twoFa: 'sent to telegram',
                  })
                } else {
                  const result = TwoFA.validateCode(user.telegram.chat, twoFa)

                  switch (result) {
                    case 'valid':
                      if (!user.wallets['usd coin']) {
                        createUSDCWalletAndSignIn()
                      } else {
                        continueSignIn()
                      }
                      break
                    case 'expired':
                      res.status(400).send({
                        message: '2FA code expired',
                      })
                      break
                    default:
                      res.status(400).send({
                        message: 'Invalid 2FA code',
                      })
                      break
                  }
                }
              } else if (!user.wallets['usd coin']) {
                createUSDCWalletAndSignIn()
              } else {
                continueSignIn()
              }
            } else {
              res.status(403).send({
                stage: "We don't remember you well",
                message:
                  'Provided e-mail or password is invalid. Did you forget something?',
              })
            }
          })
        }
      },
    )
  } catch (e) {
    res.status(400).send({
      stage: "We don't remember you well",
      message:
        'Provided e-mail or password is invalid. Did you forget something?',
    })
  }
})

router.get('/', expressip().getIpInfoMiddleware, (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const verifiedToken = UserToken.verify(token)

    const route = req.headers.route

    var location = null

    if (!req.ipInfo.error && !verifiedToken.lock_location) {
      location = {
        ip: req.ipInfo.ip,
        city: req.ipInfo.city,
        country: req.ipInfo.country,
      }
    }

    User.findById(verifiedToken.user._id, (err, user) => {
      if (user) {
        if (!user.wallets['usd coin']) {
          res.end()
          return
        }

        if (route) {
          UserLogger.register(
            UserMiddleware.convertUser(user),
            200,
            'visited',
            'action.user.visited.' + route.toLowerCase(),
          )
        }


        var fetchingData = {
          dialogue: SupportDialogue.findOne({ user: user._id }, null).lean(),
          manager: User.findOne({ email: user.bindedTo }, null).lean(),
          generalDialogue: getGeneralLobbyMessages(user._id),
          transactions: UserWallet.getTransactionsByUserId(
            user._id,
            false,
            true,
          ),
        }

        let token = UserToken.authorizationToken(user, verifiedToken.lock_location)
        req.session.auth = token

        Promise.all(Object.values(fetchingData))
          .then(data => {
            var [dialogue, manager, generalDialogue, transactions] = data

            const token = UserToken.authorizationToken(
              user,
              verifiedToken.lock_location,
            )
            const profile = buildProfile(
              user,
              dialogue,
              transactions,
              CryptoMarket.userCharts(),
              manager,
              location,
              generalDialogue,
            )

            profile.supportPin = UserMiddleware.generateSupportPin()

            res.send({
              token,
              profile,
              messages: dialogue ? dialogue.messages : [],
              generalChatMessages: generalDialogue?.messages || [],
            })
          })
          .catch(err => {
            console.log(err)
            res.status(400).send({})
          })
      } else {
        res.status(404).send({
          stage: 'Who is this?',
          message: 'This user has not been found.',
        })
      }
    })
  } catch {
    res.status(403).send({
      stage: 'Autorization failed',
      message: 'You are not logged in.',
    })
  }
})

router.get('/check-ref', (req, res) => {
  const { ref } = req.query
  console.log(ref)
  if (!ref) {
    res.send({
      id: ref,
    })
  } else {
    ReferralLink.findById(ref, 'airdropAmount currency', (err, link) => {
      if (link?.airdropAmount) {
        res.send({
          id: ref,
          airdrop: { amount: link.airdropAmount, currency: link.currency }
        })
      } else {
        res.send({
          id: ref,
        })
      }
    })
  }
})

module.exports = router

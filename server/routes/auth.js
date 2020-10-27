const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')

const random = require('lodash/random')
const nanoid = require('nanoid').nanoid

const User = require('../models/User')
const Transaction = require('../models/Transaction')
const Deposit = require('../models/Deposit')

const UserMiddleware = require('../user/middleware')
const UserConfirmation = require('../user/confirmation')
const UserPasswordReset = require('../user/passwordReset')
const UserWallet = require('../user/wallet')
const UserRole = require('../user/roles')
const UserToken = require('../user/token')
const UserLogger = require('../user/logger')

const CryptoMarket = require('../crypto/market')
const SupportDialogue = require('../models/SupportDialogue')

const buildProfile = (user, dialogue, transactions, chartsData, manager) => {
  let wallets = {
    bitcoin: null,
    ethereum: null,
    litecoin: null,
  }

  Object.keys(wallets).forEach(currency => {
    wallets[currency] = {
      ...user.wallets[currency],
      price: UserWallet.prices[currency].price,
    }
  })

  if (chartsData) {
    chartsData.forEach(chart => {
      wallets[chart.coin].chartPoints = chart.points
    })
  }

  let popup = user.popup
  user.popup = null
  user.save(null)

  let profile = {
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName || '',
    wallets,
    newMessages: dialogue ? dialogue.unread : 0,
    transactions,
    settings: {
      commission: manager ? manager.role.settings.commission : 1,
    },
    popup,
  }

  if (user.role.name != 'user') {
    profile.id = user._id
  }

  return profile
}

const expressip = require('express-ip')

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
        UserPasswordReset.email(email, user._id)
        res.send({
          stage: 'Password reset requested',
          message:
            'We sent you an email! Open it and click on the link to continue.',
        })
      }
    })
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
  if (req.body.email) {
    const email = req.body.email

    User.exists({ email }, (err, exists) => {
      if (exists) {
        res.status(409).send({
          stage: 'Still in need of confirmation',
          message: 'This e-mail address is already taken. Please try another.',
        })
      } else {
        const code = random(100000, 999999, false)

        UserConfirmation.email(email, code)
          .then(() => {
            res.status(200).send({
              token: UserToken.confirmationToken(code, email),
              stage: 'In need of confirmation',
              message:
                'We have just sent you a confirmation code. Please check your e-mail to proceed with registration.',
            })
          })
          .catch(() => {
            res.status(404).send({
              stage: 'In need of confirmation',
              message:
                "Something went wrong while we tried to send a confirmation email. Shouldn't you check spelling?",
            })
          })
      }
    })
  } else {
    res.status(400).send({
      stage: 'In need of confirmation',
      message: 'We just want you to enter your e-mail address. Would you mind?',
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
          token: UserToken.registrationToken(confirmationPair.email),
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
  try {
    const registerToken = req.headers.authorization.split(' ')[1]
    const verifiedToken = UserToken.verify(registerToken)

    if (verifiedToken.stage == 'registration') {
      var email = verifiedToken.email
      email = email.split('@')[0] + '@' + email.split('@')[1].toLowerCase()

      User.exists({ email }, (err, exists) => {
        if (exists) {
          res.status(409).send({
            stage: 'Still in need of confirmation',
            message:
              'This e-mail address is already taken. Please try another.',
          })
        } else {
          const salt = bcrypt.genSaltSync(7)
          const hashedPassword = bcrypt.hashSync(req.body.password, salt)

          const userid = nanoid()
          const role = Object.keys(UserRole.reservation).includes(email)
            ? UserRole.reservation[email]
            : 'user'

          UserWallet.create(email)
            .then(wallets => {
              new User({
                _id: userid,
                email,
                wallets,
                role: UserRole[role],
                password: hashedPassword,
                firstName: req.body.firstName || email,
                lastName: req.body.lastName,
              }).save((err, user) => {
                if (!err) {
                  UserLogger.register(
                    UserMiddleware.convertUser(user),
                    201,
                    'registered',
                    'action.user.registered',
                  )

                  const availableCoins = ['bitcoin', 'litecoin', 'ethereum']
                  const charts = availableCoins.map(coin =>
                    CryptoMarket.historyLinearChart(coin),
                  )

                  Promise.all(charts)
                    .then(chartsData => {
                      let token = UserToken.authorizationToken(userid)

                      res.cookie('Authorization', token, {
                        sameSite: 'lax',
                      })

                      res.status(201).send({
                        token,
                        stage: 'Well done',
                        message: 'Registration went well!',
                        profile: buildProfile(user, null, [], chartsData),
                      })
                    })
                    .catch(() => {
                      res.status(400).send({
                        stage: 'Unexpected error',
                        message: "Can't get coins prices.",
                      })
                    })
                } else {
                  User.findByIdAndRemove(user._id, () => {})
                  res.status(400).send({
                    stage: 'Unexpected error',
                    message: "Can't create the user.",
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
  } catch {
    res.status(403).send({
      stage: 'In need of confirmation',
      message: 'You must confirm your e-mail before doing this.',
    })
  }
})

router.post('/signin', UserMiddleware.validateSignin, (req, res) => {
  try {
    const email =
      req.body.email.split('@')[0] +
      '@' +
      req.body.email.split('@')[1].toLowerCase()

    User.findOne(
      {
        email,
      },
      (err, user) => {
        if (!user) {
          res.status(404).send({
            stage: "We don't remember you well",
            message:
              'Provided e-mail or password is invalid. Did you forget something?',
          })
        } else {
          bcrypt.compare(req.body.password, user.password, (err, success) => {
            if (success) {
              const token = UserToken.authorizationToken(user._id)

              res.cookie('Authorization', token, {
                sameSite: 'lax',
              })

              SupportDialogue.findOne({ user: user._id }, (err, dialogue) => {
                Transaction.find({}, (err, result) => {
                  let transactions = result
                    .filter(
                      t =>
                        (t.sender === user._id || t.recipient === user._id) &&
                        t.visible,
                    )
                    .map(t => ({
                      at: t.at,
                      amount: t.amount,
                      currency: t.currency,
                      name: t.name,
                      status: t.status,
                      type: t.sender === user._id ? 'sent to' : 'received',
                    }))

                  let username = (
                    user.firstName.split('@')[0] +
                    (user.lastName ? ' ' + user.lastName : '') +
                    '!'
                  ).trim()

                  res.status(202).send({
                    token,
                    stage: 'Welcome, ' + username,
                    message: 'You have just joined us!',
                    profile: buildProfile(user, dialogue, transactions),
                    messages: dialogue ? dialogue.messages : [],
                  })
                })
              })

              UserLogger.register(
                UserMiddleware.convertUser(user),
                202,
                'authenticated',
                'action.user.authenticated',
              )
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
  } catch {
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

    if (!req.ipInfo.error) {
      location = {
        ip: req.ipInfo.ip,
        city: req.ipInfo.city,
        country: req.ipInfo.country,
      }
    }

    User.findByIdAndUpdate(
      verifiedToken.user,
      {
        $set: location
          ? {
              location,
            }
          : {},
      },
      {
        useFindAndModify: false,
      },
      (err, user) => {
        if (user) {
          User.findById(user.bindedTo, (err, manager) => {
            if (route) {
              UserLogger.register(
                UserMiddleware.convertUser(user),
                200,
                'visited',
                'action.user.visited.' + route.toLowerCase(),
              )
            }

            const availableCoins = ['bitcoin', 'litecoin', 'ethereum']
            const charts = availableCoins.map(coin =>
              CryptoMarket.historyLinearChart(coin),
            )

            var fetchingData = {
              chartsData: Promise.all(charts),
              dialogue: SupportDialogue.findOne({ user: user._id }, null),
              transactions: Transaction.find({ visible: true }, null),
              deposits: UserWallet.getDepositsByUserId(user._id),
              withdrawals: UserWallet.getWithdrawalsByUserId(user._id),
            }

            res.cookie(
              'Authorization',
              UserToken.authorizationToken(verifiedToken.user),
              {
                sameSite: 'lax',
              },
            )

            Promise.all(Object.values(fetchingData)).then(data => {
              var [
                chartsData,
                dialogue,
                transactions,
                deposits,
                withdrawals,
              ] = data

              transactions = transactions
                .filter(t => t.sender === user._id || t.recipient === user._id)
                .map(t => ({
                  at: t.at,
                  amount: t.amount,
                  currency: t.currency,
                  name: t.name,
                  status: t.status,
                  type: t.sender === user._id ? 'sent to' : 'received',
                }))
              transactions = [...transactions, ...deposits, ...withdrawals]

              const token = UserToken.authorizationToken(user._id)
              const profile = buildProfile(
                user,
                dialogue,
                transactions,
                chartsData,
                manager,
              )

              res.send({
                token,
                profile,
                messages: dialogue ? dialogue.messages : [],
              })
            })
          })
        } else {
          res.status(404).send({
            stage: 'Who is this?',
            message: 'This user has not been found.',
          })
        }
      },
    )

    // User.findById(verifiedToken.user, (err, user) => {
    //
    // })
  } catch {
    res.status(403).send({
      stage: 'Autorization failed',
      message: 'You are not logged in.',
    })
  }
})

module.exports = router

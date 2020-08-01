const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')
const Joi = require('@hapi/joi')

const random = require('lodash/random')
const nanoid = require('nanoid').nanoid

const User = require('../models/User')

const UserMiddleware = require('../user/middleware')
const UserConfirmation = require('../user/confirmation')
const UserWallet = require('../user/wallet')
const UserToken = require('../user/token')
const CryptoMarket = require('../crypto/market')
const Logger = require('../user/logger')

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

          new User({
            _id: userid,
            email,
            password: hashedPassword,
            firstName: req.body.firstName || email.split('@')[0],
            lastName: req.body.lastName,
          }).save((err, user) => {
            if (!err) {
              UserWallet.create(email).then(hashedAddresses => {
                User.findByIdAndUpdate(
                  user._id,
                  {
                    $set: {
                      wallets: hashedAddresses,
                    },
                  },
                  {
                    useFindAndModify: false,
                  },
                  () => {
                    Logger.register(
                      user._id,
                      201,
                      'registered',
                      'action.user.registered',
                    )
                    res.status(201).send({
                      token: UserToken.authorizationToken(userid),
                      stage: 'Well done',
                      message: 'Registration went well!',
                    })
                  },
                )
              })
            } else {
              User.findByIdAndRemove(user._id, () => {})
              res.status(400).send({
                stage: 'Unexpected error',
                message: "Can't create the user.",
              })
            }
          })
        }
      })
    } else {
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
                sameSite: 'Lax',
              })

              res.status(202).send({
                token,
                stage:
                  'Welcome, ' +
                  (user.firstName + ' ' + user.lastName + '!').trim(),
                message: 'You have just joined us!',
                profile: {
                  email: user.email,
                  role: user.role,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  wallets: UserWallet.verify(user.wallets),
                  balance: user.balance,
                },
              })

              Logger.register(
                user._id,
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

router.get('/', (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const verifiedToken = UserToken.verify(token)
    const route = req.headers.route

    User.findById(verifiedToken.user, (err, user) => {
      if (user) {
        if (route)
          Logger.register(
            user._id,
            200,
            'visited',
            'action.user.visited',
            route,
          )

        const availableCoins = ['bitcoin', 'litecoin', 'ethereum']
        const charts = availableCoins.map((
          coin, // turns 'bitcoin' into CryptoMarket.historyLinearChart('bitcoin')(Promise)
        ) => CryptoMarket.historyLinearChart(coin))

        Promise.all(charts).then(data => {
          UserWallet.verify(user.wallets).then(verifiedWallets => {
            verifiedWallets = verifiedWallets.map(wallet => {
              // merging linear charts and wallets
              var w = null

              data.forEach(chart => {
                if (chart.coin === wallet.currency) {
                  w = { ...wallet, chartPoints: chart.points }
                }
              })

              return w
            })

            const token = UserToken.authorizationToken(verifiedToken.user)

            res.cookie('Authorization', token, {
              sameSite: 'Lax',
            })

            res.send({
              token,
              profile: {
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                wallets: verifiedWallets,
                balance: user.balance,
              },
            })
          })
        })
      } else {
        res.status(404).send({
          stage: 'Who is this?',
          message: 'This user has not been found.',
        })
      }
    })
  } catch {
    res.sendStatus(403)
  }
})

module.exports = router

require('../../user/updateProfiles')


const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')
const Joi = require('@hapi/joi')
const XRegExp = require('xregexp')

const User = require('../../models/User')

const UserToken = require('../../user/token')
const Logger = require('../../user/logger')
const UserMiddleware = require('../../user/middleware')


router.post('/update', UserMiddleware.requireAccess, (req, res) => {
  const userId = UserMiddleware.parseUserId(req, res)

  if (!userId) return

  if (req.body.firstName || req.body.lastName) {
    const error = Joi.object({
      firstName: Joi.string().pattern(XRegExp('^\\p{L}+$')),
      lastName: Joi.string().pattern(XRegExp('^\\p{L}+$')),
    }).validate({
      firstName: req.body.firstName || 'a',
      lastName: req.body.lastName || 'a',
    }).error

    if (error) {
      res.status(406).send({
        stage: 'Validation',
        message: 'Names should include only letters.',
      })
    } else {
      User.findOne({ _id: userId }, (err, user) => {
        User.findByIdAndUpdate(
          userId,
          {
            $set:
              req.body.firstName && req.body.lastName
                ? {
                  firstName: req.body.firstName,
                  lastName: req.body.lastName,
                }
                : req.body.firstName
                  ? {
                    firstName: req.body.firstName,
                  }
                  : {
                    lastName: req.body.lastName,
                  },
          },
          {
            useFindAndModify: false,
          },
          (err, modified) => {
            modified.firstName = req.body.firstName || modified.firstName
            modified.lastName = req.body.lastName || modified.lastName

            Logger.register(
              UserMiddleware.convertUser(user),
              200,
              'name_changed',
              'action.user.nameChanged',
              (modified.firstName + ' ' + modified.lastName).trim(),
            )

            res.status(200).send({
              token: UserToken.authorizationToken(user),
              stage: 'Nice to meet you',
              message: "You've successfully changed your name!",
              profile: user,
            })
          },
        ).lean()
      }).lean()
    }
  } else if (
    req.body.password &&
    req.body.newPassword &&
    req.body.repeatNewPassword
  ) {
    const error = Joi.object({
      password: Joi.string()
        .pattern(/^[0-9A-Za-z#$%=@!{},`~&*()'<>?.:;_|^\/+\t\r\n\[\]"-]{6,32}$/)
        .required()
        .error(
          new Error('Passwords must contain 6 to 32 alphanumeric characters.'),
        ),
      newPassword: Joi.string()
        .pattern(/^[0-9A-Za-z#$%=@!{},`~&*()'<>?.:;_|^\/+\t\r\n\[\]"-]{6,32}$/)
        .required()
        .error(
          new Error('Passwords must contain 6 to 32 alphanumeric characters.'),
        ),
      repeatNewPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .error(new Error("New passwords don't match.")),
    }).validate({
      password: req.body.password,
      newPassword: req.body.newPassword,
      repeatNewPassword: req.body.repeatNewPassword,
    }).error

    if (error) {
      res.status(406).send({
        stage: 'Validation',
        message: error.message,
      })
    } else {
      User.findById(userId, (err, user) => {
        if (user) {
          bcrypt.compare(req.body.password, user.password, (err, success) => {
            if (success) {
              const salt = bcrypt.genSaltSync(7)
              const hashedPassword = bcrypt.hashSync(req.body.newPassword, salt)

              User.findByIdAndUpdate(
                userId,
                {
                  $set: {
                    password: hashedPassword,
                  },
                },
                {
                  useFindAndModify: false,
                },
                err => {
                  Logger.register(
                    UserMiddleware.convertUser(user),
                    200,
                    'password_changed',
                    'action.user.passwordChanged',
                  )
                  res.status(200).send({
                    token: UserToken.authorizationToken(user),
                    stage: 'Now this is the most safety account',
                    message: "You've successfully changed your password!",
                  })
                },
              ).lean()
            } else {
              res.status(403).send({
                stage: 'Canceled',
                message: "You've entered a wrong password.",
              })
            }
          })
        } else {
          res.status(404).send({
            stage: 'Who is this?',
            message: 'This user has not been found.',
          })
        }
      }).lean()
    }
  } else {
    if (req.body.firstName || req.body.lastName) {
      res.status(400).send({
        stage: 'Error 400',
        message: 'Bad Request',
      })
    }
  }
})

router.get('/update/avatar', UserMiddleware.requireAccess, (req, res) => {
  const userId = UserMiddleware.parseUserId(req, res)

  const avatars = [
    'https://i.ibb.co/yycbt3F/USDT.jpg',
    'https://i.ibb.co/jytq3hH/XRP.jpg',
    'https://i.ibb.co/d0xVzD0/BNB.jpg',
    'https://i.ibb.co/Sv7cqvB/BTC.jpg',
    'https://i.ibb.co/wNZW3Jd/ETH.jpg',
    'https://i.ibb.co/Mkmkmw8/LTC.jpg',
  ]

  const n = parseInt(req.query.n)

  if (isNaN(n)) {
    res.status(400).send({
      stage: 'Profile',
      message: 'Unknown picture'
    })
  } else {
    User.findByIdAndUpdate(
      userId,
      {
        $set: {
          pic: avatars[n]
        }
      },
      {
        useFindAndModify: false,
      },
      (err, doc) => {
        res.send({
          stage: 'Profile',
          message: 'Avatar is set'
        })
      })
  }
})

module.exports = router
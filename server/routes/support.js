const axios = require('axios')
const express = require('express')
const router = new express.Router()
const FormData = require('form-data')

require('dotenv/config')

const jwt = require('jsonwebtoken')
const moment = require('moment')

const TelegramBot = require('../telegram-bot')

const SupportDialogue = require('../models/SupportDialogue')
const UserMiddleware = require('../user/middleware')
const User = require('../models/User')

//#region [rgba(10,10,10,1)] Functions

const newMessage = text => ({
  text,
  date: +moment(),
  delivered: true,
  yours: false,
})

const sendMessage = (from, { message: text, attached }) =>
  new Promise((resolve, reject) => {
    {
      User.findOne(
        { _id: from },
        'role email firstName lastName bindedTo',
        (err, user) => {
          if (user.role.name !== 'user') {
            reject()
          } else {
            const message = newMessage(text)

            if (attached) message.image = { url: attached.image, name: attached.filename }

            SupportDialogue.findOne({ user: from }, (err, dialogue) => {
              if (!dialogue) {
                new SupportDialogue({
                  user: from,
                  supportUnread: 1,
                  messages: [message],
                }).save((err, dialogue) => {
                  resolve(message)
                })

                TelegramBot.notifyManager(
                  user,
                  `✉️ You've got new message!\n\nfrom: ${user.email}\n\n«${message.text}»`,
                )
              } else {
                dialogue.messages.push(message)
                dialogue.supportUnread += 1

                if (dialogue.supportUnread > 1) {
                  TelegramBot.notifyManager(
                    user,
                    `📬 You have ${dialogue.supportUnread} unanswered messages from this user and here is another one!\n\nfrom: ${user.email}\n\n«${message.text}»`,
                  )
                } else {
                  TelegramBot.notifyManager(
                    user,
                    `✉️ You've got new message!\n\nfrom: ${user.email}\n\n«${message.text}»`,
                  )
                }

                dialogue.save(() => {
                  resolve(message)
                })
              }
            })
          }
        },
      )
    }
  })

const getDialogue = user =>
  new Promise((resolve, reject) => {
    User.findOne({ _id: user }, 'role', (err, result) => {
      if (result.role.name !== 'user') {
        reject()
      } else {
        SupportDialogue.findOne({ user }, (err, dialogue) => {
          if (dialogue) {
            dialogue.unread = 0
            dialogue.save(null)
          }

          resolve(dialogue ? dialogue.messages : [])
        })
      }
    })
  })

//#endregion

router.post('/', (req, res) => {
  try {
    const userId = jwt.verify(req.body.token.split(' ')[1], process.env.SECRET)
      .user

    sendMessage(userId, req.body)
      .then(message => res.send({ message }))
      .catch(err => {
        console.log('FJf0ujja err: ' + err)
        res.sendStatus(400)
      })
  } catch {
    res.sendStatus(403)
  }
})

router.get('/', (req, res) => {
  const userId = UserMiddleware.parseUserId(req, res)

  if (!userId) return false

  getDialogue(userId)
    .then(messages => {
      res.send({
        messages: messages.map(msg => {
          msg.yours = !msg.yours

          return msg
        }),
      })
    })
    .catch(err => {
      console.log('dasD0a err: ' + err)
      res.sendStatus(400)
    })
})

router.post('/upload', UserMiddleware.requireAccess, (req, res) => {
  if (req.body.image && req.body.filename.match('.+\.[a-zA-Z0-9]{3,4}')) {
    try {
      var formData = new FormData()

      formData.append('image', req.body.image)
      formData.append('key', process.env.IMGBB_API_KEY)

      axios.post('https://api.imgbb.com/1/upload', formData, { headers: formData.getHeaders() }).then(({ data }) => {
        if (data.success) {
          res.send({
            filename: req.body.filename,
            image: data.data.image.url
          })
        } else {
          res.status(data.status).send({ message: 'Error during uploading' })
        }
      })
        .catch(err => {
          if (err.response) {
            console.log(err.response.data)
          } else {
            console.log(err.message)
          }
        })
    } catch (err) {
      console.log(err)
      res.status(401).send({ message: 'Invalid request' })
    }
  } else {
    res.status(400).send({ message: 'Invalid request' })
  }
})

module.exports = router

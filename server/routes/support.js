const express = require('express')
const router = new express.Router()

const jwt = require('jsonwebtoken')
const moment = require('moment')

const SupportDialogue = require('../models/SupportDialogue')
const UserMiddleware = require('../user/middleware')
const User = require('../models/User')

//#region [rgba(10,10,10,1)] Functions

const newMessage = text => ({
  text,
  date: moment().format('DD.MM.YY H:mm:ss'),
  delivered: true,
  yours: false,
})

const sendMessage = (from, text) =>
  new Promise((resolve, reject) => {
    {
      User.findOne({ _id: from }, (err, result) => {
        if (['manager', 'admin'].includes(result.role.name)) {
          reject()
        } else {
          SupportDialogue.findOne({ user: from }, (err, dialogue) => {
            if (!dialogue) {
              new SupportDialogue({
                user: from,
                supportUnread: 1,
                messages: [newMessage(text)],
              }).save((err, dialogue) => {
                resolve(newMessage(text))
              })
            } else {
              SupportDialogue.findOne({ user: from }, (err, dialogue) => {
                dialogue.messages.push(newMessage(text))

                SupportDialogue.findByIdAndUpdate(
                  dialogue._id,
                  {
                    $set: {
                      messages: dialogue.messages,
                      supportUnread: dialogue.supportUnread + 1,
                    },
                  },
                  {
                    useFindAndModify: false,
                  },
                  (err, modified) => {
                    resolve(newMessage(text))
                  },
                )
              })
            }
          })
        }
      })
    }
  })

const getDialogue = user =>
  new Promise((resolve, reject) => {
    User.findOne({ _id: user }, (err, result) => {
      if (['manager', 'admin'].includes(result.role.name)) {
        reject()
      } else {
        SupportDialogue.findOne({ user }, (err, dialogue) => {
          SupportDialogue.findByIdAndUpdate(
            dialogue._id,
            {
              $set: {
                unread: 0,
              },
            },
            {
              useFindAndModify: false,
            },
            (err, modified) => {},
          )
          resolve(dialogue?.messages ?? [])
        })
      }
    })
  })

//#endregion

router.post('/', (req, res) => {
  try {
    const userId = jwt.verify(req.body.token.split(' ')[1], process.env.SECRET)
      .user

    sendMessage(userId, req.body.message)
      .then(message => res.send({ message }))
      .catch(err => {
        console.log(err)
        res.sendStatus(400)
      })
  } catch {
    res.sendStatus(403)
  }
})

router.get('/', (req, res) => {
  const userId = UserMiddleware.parseUserId(req)
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
      console.log(err)
      res.sendStatus(400)
    })
})

module.exports = router

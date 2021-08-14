const moment = require('moment')
const express = require('express')
const router = express.Router()

const { requirePermissions } = require('./index')

const Chat = require('../../chat')

const User = require('../../models/User')
const SupportDialogue = require('../../models/SupportDialogue')


const sendMessage = (to, text) =>
  new Promise((resolve, reject) => {
    {
      const message = {
        text,
        date: +moment(),
        delivered: true,
        yours: true,
      }

      resolve(message)

      User.findOne({ _id: to }, 'role', (err, user) => {
        if (!user || user.role.name !== 'user') {
          reject()
        } else {

          SupportDialogue.findOne({ user: to }, (err, dialogue) => {
            if (!dialogue) {
              new SupportDialogue({
                user: to,
                unread: 1,
                messages: [message],
              }).save(null)
            } else {
              dialogue.messages.push(message)
              dialogue.unread = dialogue.unread + 1
              dialogue.supportUnread = 0
              dialogue.save(null)
            }
          })
        }
      }).lean()
    }
  })

const getUserAndDialogue = (user, read) =>
  new Promise((resolve, reject) => {
    User.findOne({ _id: user }, (err, result) => {
      if (result && result.role.name !== 'user') {
        reject()
      } else {
        SupportDialogue.findOne({ user }, (err, dialogue) => {
          if (dialogue) {
            if (read) {
              dialogue.supportUnread = 0
              dialogue.save(null)
            }

            result.supportUnread = dialogue.supportUnread
            result.save({})

            resolve(dialogue.messages)
          } else {
            resolve([])
          }
        }).lean(!read)
      }
    })
  })

const updateMessages = (messages, userid) => {
  return new Promise((resolve, reject) => {
    SupportDialogue.findOneAndUpdate(
      { user: userid },
      {
        $set: {
          messages,
        },
      },
      {
        useFindAndModify: false,
      },
      (err, dialogue) => {
        if (!err && dialogue) {
          resolve(dialogue.messages)
        } else {
          reject()
        }
      },
    )
  })
}



router.post(
  '/support/:id/send',
  requirePermissions('write:support.binded'),
  (req, res) => {
    const userId = req.params.id

    sendMessage(userId, req.body.message)
      .then(message => {
        res.send({ message })
      })
      .catch(() => {
        res.status(403).send()
      })
  },
)

router.post(
  '/general/:id/send',
  requirePermissions('write:support.binded'),
  (req, res) => {
    const uid = req.params.id
    const { text, user } = req.body

    const preparedMessage = {
      text,
      user,
      real: true,
      at: +moment(),
      userid: uid
    }

    Chat.saveGeneralMessage(uid, preparedMessage, true)

    res.send(preparedMessage)
  },
)

router.post(
  '/general',
  requirePermissions('write:support.binded'),
  async (req, res) => {
    const { user } = req.body

    res.send({ messages: await Chat.getGeneralLobbyMessages(user) })
  },
)

router.get(
  '/support',
  requirePermissions('write:support.binded'),
  (req, res) => {
    getUserAndDialogue(req.query.user, req.query.read)
      .then(messages => {
        res.send({
          messages,
        })
      })
      .catch(err => {
        res.sendStatus(400)
      })
  },
)

router.post(
  '/support/update',
  requirePermissions('write:support.binded'),
  (req, res) => {
    const { messages, user } = req.body

    if (!messages || typeof messages.length != 'number' || !user) {
      res.status(400).send({
        messages: 'Bad request',
      })
    } else {
      updateMessages(messages, user)
        .then(messages => {
          res.send(messages)
        })
        .catch(() => {
          res.status(409).send({
            message: 'Failed to update messages',
          })
        })
    }
  },
)


module.exports = router
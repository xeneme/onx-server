const express = require('express')
const router = express.Router()

const Support = require('../../models/SupportDialogue')

const { saveSupportMessage, saveGeneralMessage } = require('../../chat')
const UserMiddleware = require('../../user/middleware')
const Notification = require('../../manager/notification')


router.post('/support', UserMiddleware.requireAccessLight('firstName lastName email bindedTo'), (req, res) => {
  const user = res.locals.user
  const uid = user._id
  const { message, attached } = req.body

  const preparedMessage = {
    text: message,
    date: +new Date(),
    yours: false,
    user: uid,
  }

  if (attached) {
    preparedMessage.attached = attached
  }

  if (user.bindedTo) {
    Notification.create({
      manager: user.bindedTo,
      scope: 'support',
      user,
      text: message
    })
  }

  saveSupportMessage(uid, preparedMessage)

  res.send(preparedMessage)
})

router.get('/support', UserMiddleware.requireAccessLight(), (req, res) => {
  const uid = res.locals.user._id

  Support.findOne({ user: uid }, 'messages', (err, dialogue) => {
    const messages = dialogue?.messages || []
    res.send({ messages })
  }).lean()
})

router.get('/support/read', UserMiddleware.requireAccessLight(), (req, res) => {
  const uid = res.locals.user._id
  res.send({ status: 'SUCCESS' })

  Support.findOne({ user: uid }, 'unread', (err, dialogue) => {
    if (dialogue) {
      dialogue.unread = 0
      dialogue.save(null)
    }
  })
})

router.post('/general', UserMiddleware.requireAccessLight(), (req, res) => {
  const uid = res.locals.user._id
  const { text, user } = req.body

  const preparedMessage = {
    text,
    user,
    real: true,
    at: +new Date(),
    userid: uid
  }

  saveGeneralMessage(uid, preparedMessage)

  res.send(preparedMessage)
})

module.exports = router
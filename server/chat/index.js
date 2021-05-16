const axios = require('axios')
const parse5 = require('parse5')
const moment = require('moment')
const _ = require('underscore')
const jwt = require('jsonwebtoken')

const SupportDialogue = require('../models/SupportDialogue')
const GeneralChatDialogue = require('../models/GeneralChatDialogue')
const User = require('../models/User')

const TelegramBot = require('../telegram-bot')

var IO = null

var yobitAvatars = {}
var avatars = [
  'https://i.ibb.co/yycbt3F/USDT.jpg',
  'https://i.ibb.co/jytq3hH/XRP.jpg',
  'https://i.ibb.co/d0xVzD0/BNB.jpg',
  'https://i.ibb.co/Sv7cqvB/BTC.jpg',
  'https://i.ibb.co/wNZW3Jd/ETH.jpg',
  'https://i.ibb.co/Mkmkmw8/LTC.jpg',
]
var yobitMessages = []

function updateYobitMessages() {
  axios.get('https://yobit.net/en', {
    headers: {
      cookie: 'cf_clearance=777b8cac18e954b4fcbed4c07090dcfb02bf95db-1616942762-0-150; __cfduid=d613f5881472c718644fcc504e8d349551616942762; locale=en; f63ce094518f5b56a429e6392aa59c92=1; LLXR=1616942763; LLXUR=b27fdfb8ac84; Rfr=https%3A%2F%2Fyobit.net%2Fen; PHPSESSID=qgh263v1092deurpfeiaro1975; 996c49c4ba6523f89a52125721f65c23=1; __cf_bm=e65da559aad6bd6a8d5dc8763431cb669f73fba5-1616942812-1800-Ae8CiH/f7XxnwKiGOjv7bdIp9PJ2JKL/YI9NOxJoEwUumw2aADMbYQn9+PBzzMnUxfQJfBx0xo0Q+KrlkXhjRQRhHWoxEcGGxFrvkG+C87PuIoKCTfFcxwzYJFgzThX1ZA=='
    },
  }).then(({ data }) => {
    try {
      const match = parse5.parse(data)
      let html = _.find(match.childNodes, child => child.tagName == 'html')
      let body = _.find(html.childNodes, child => child.tagName == 'body')
      let wrapper = _.find(body.childNodes, child => child.tagName == 'div' && child.attrs[0].value == 'wrapper')
      let main = _.find(wrapper.childNodes, child => child.tagName == 'main' && child.attrs[0].value == 'content')
      let wrap = _.find(main.childNodes, child => child.tagName == 'div' && child.attrs[0].value == 'wrap')
      let rightBar = _.find(wrap.childNodes, child => child.tagName == 'div' && child.attrs[0].value == 'right_bar')
      let chatBox = _.find(rightBar.childNodes, child => child.tagName == 'div' && child.attrs[0].value == 'chat_box')
      let inset = _.find(chatBox.childNodes, child => child.tagName == 'div' && child.attrs[0].value == 'inset')
      let scrolling = _.find(inset.childNodes, child => child.tagName == 'div' && child.attrs[0].value == 'scrolling chatlarge')
      let viewport = _.find(scrolling.childNodes, child => child.tagName == 'div' && child.attrs[0].value == 'viewport')
      let overview = _.find(viewport.childNodes, child => child.tagName == 'div' && child.attrs[0].value == 'overview')

      yobitMessages = overview.childNodes.filter(n => n.tagName == 'p').map(node => {
        let link = _.find(node.childNodes, c => c.tagName == 'a' && c.attrs[0].value.startsWith('nick '))

        if (!link) return

        let name = link.childNodes[0].value

        let time = link.attrs[1]?.value
        let date = new Date()
        let y = date.getUTCFullYear()
        let m = date.getUTCMonth() + 1
        let d = date.getUTCDate()
        m = m < 10 ? '0' + m : m
        d = d < 10 ? '0' + d : d

        let ts = ((moment.parseZone(`${y}-${m}-${d}T${time}+02:00`).unix() * 1000))

        let text = _.find(node.childNodes, c => c.nodeName == '#text').value
        text = text.split(':')
        text = text.slice(1, text.length).join('')

        return {
          text,
          at: ts,
          user: {
            firstName: name,
            lastName: '',
            pic: '',
          },
        }
      })
        .filter(message => message && !message.text.match(/(scam|yobit)/gi))
        .sort((a, b) => a.at - b.at)

      const names = yobitMessages.map(m => m.user.firstName)

      names.forEach(name => {
        if (!Object.keys(yobitAvatars).includes(name)) {
          let r = Math.floor(Math.random() * avatars.length + 3)
          yobitAvatars[name] = avatars[r] || ''
        }
      })

      yobitMessages = yobitMessages.map(m => ({
        ...m,
        user: {
          ...m.user,
          pic: yobitAvatars[m.user.firstName]
        }
      }))

      yobitMessages = yobitMessages.slice(yobitMessages.length - 100, yobitMessages.length)

    } catch (e) {
      console.log('ERROR: cant parse general messages', e)
    }

    setTimeout(updateYobitMessages, 1000)
  }).catch(err => {
    console.log(err.response || err.message)
  })
}

updateYobitMessages()

async function getGeneralLobbyMessages(id) {
  var dialogue = {
    messages: []
  }

  if (id != 'total') {
    dialogue = await GeneralChatDialogue.findOne({
      user: id,
    })
  }

  var msgs = [...yobitMessages, ...(dialogue?.messages || [])].sort((a, b) => a.at - b.at)
  // msgs = msgs.slice(msgs.length - 30, msgs.length)

  return msgs
}

function sendSupportMessage(id, message) {
  IO.sockets.sockets.forEach(socket => {
    let { user, admin } = socket.handshake?.query || socket.request.query

    if ([user, admin].includes(id)) {
      socket.emit('support-message', message)
    }
  })
}

function sendGeneralChatMessage(id, message) {
  IO.sockets.sockets.forEach(socket => {
    let { user, admin } = socket.handshake?.query || socket.request.query

    user = !user || user == 'total' ? socket.id : user

    if ([user, admin].includes(id)) {
      socket.emit('general-message', message)
    }
  })
}

const saveSupportMessage = (userid, message, support) =>
  new Promise((resolve) => {
    {
      User.findOne({ _id: userid },
        'role email firstName lastName bindedTo',
        (err, user) => {
          if (!user) {
            resolve()
          } else if (!support) {
            SupportDialogue.findOne({ user: userid }, (err, dialogue) => {
              if (!dialogue) {
                new SupportDialogue({
                  user: userid,
                  supportUnread: 1,
                  messages: [message],
                }).save((err, dialogue) => {
                  resolve(message)
                })
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
          } else {
            SupportDialogue.findOne({ user: userid }, (err, dialogue) => {
              if (!dialogue) {
                new SupportDialogue({
                  user: userid,
                  unread: 1,
                  messages: [message],
                }).save((err, dialogue) => {
                  resolve(message)
                })
              } else {
                dialogue.messages.push(message)
                dialogue.unread = dialogue.unread + 1
                dialogue.supportUnread = 0
                dialogue.save(() => {
                  resolve(message)
                })
              }
            })
          }
        }).lean()
    }
  })

const saveGeneralChatMessage = (userid, message, read) =>
  new Promise((resolve) => {
    {
      if (!userid || userid == 'total') { resolve(); return }

      User.findOne({ _id: userid },
        'role email firstName lastName bindedTo',
        (err, user) => {
          if (!user) {
            resolve()
          } else {
            GeneralChatDialogue.findOne({ user: userid }, (err, dialogue) => {
              if (!dialogue) {
                new GeneralChatDialogue({
                  user: userid,
                  unread: +!read,
                  messages: [message],
                }).save((err, dialogue) => {
                  resolve(message)
                })
              } else {
                dialogue.messages.push(message)
                if (read) {
                  dialogue.unread = 0
                } else {
                  dialogue.unread += 1
                }

                dialogue.save(() => {
                  resolve(message)
                })
              }
            })
          }
        }).lean()
    }
  })


module.exports = {
  init: io => {
    IO = io
    io.on('connection', socket => {
      var { user, admin, lobby } = socket.handshake?.query || socket.request.query

      user = !user || user == 'total' ? socket.id : user

      if (!admin) {
        getGeneralLobbyMessages(user).then(messages => {
          socket.emit('set-general-messages', messages)
        }).catch(err => {
          console.log(err)
        })
      } else {
        socket.on('get-general-messages', userId => {
          getGeneralLobbyMessages(userId).then(messages => {
            socket.emit('set-general-messages', messages)
          }).catch(err => {
            console.log(err)
          })
        })
      }

      socket.on('message', ({ userId, message }) => {
        user = userId || user

        const preparedMessage = { ...message, real: true, at: +new Date(), userid: user }

        saveGeneralChatMessage(user, preparedMessage, admin) // saving the message to the database

        socket.emit('general-message', preparedMessage) // giving it back
        sendGeneralChatMessage(userId || lobby, preparedMessage) // to other side
      })

      socket.on('support-message', ({ userId, token, message }) => {
        try {
          const userObj = jwt.verify(token.split(' ')[1], process.env.SECRET).user

          const support = userId ? true : userObj.role.name != 'user'

          user = userId || user

          const preparedMessage = {
            text: message,
            date: +new Date(),
            yours: support,
            user,
            // image: attached
            // ? {
            // url: attached.image,
            // name: attached.filename
            // } : null
          }

          saveSupportMessage(user, preparedMessage, support) // saving the message to the database

          socket.emit('support-message', preparedMessage) // giving it back
          sendSupportMessage(userId || lobby, preparedMessage) // to other side
        } catch { }
      })
    })
  },
  getGeneralLobbyMessages,
  saveSupportMessage,
  saveGeneralChatMessage
}
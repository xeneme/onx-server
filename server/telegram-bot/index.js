require('dotenv/config')

const bcrypt = require('bcryptjs')
const moment = require('moment')
const TelegramBot = require('node-telegram-bot-api')

const User = require('../models/User')
const SupportDialogue = require('../models/SupportDialogue')
const TwoFA = require('./2fa')

const Bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true })

const signIn = (email, password) => {
  return new Promise((resolve, reject) => {
    try {
      User.findOne(
        {
          email,
        },
        (err, user) => {
          if (!user) {
            reject({
              stage: "We don't remember you well",
              message:
                'Provided e-mail or password is invalid. Did you forget something?',
            })
          } else {
            bcrypt.compare(password, user.password, (err, success) => {
              if (success) {
                resolve(user)
              } else {
                reject({
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
      reject({
        stage: "We don't remember you well",
        message:
          'Provided e-mail or password is invalid. Did you forget something?',
      })
    }
  })
}

const newMessage = text => ({
  text,
  date: +moment(),
  delivered: true,
  yours: true,
})

const sendSupportMessage = (email, text) =>
  new Promise((resolve, reject) => {
    {
      User.findOne({ email }, 'role', (err, result) => {
        if (result.role.name !== 'user') {
          reject()
        } else {
          const message = newMessage(text)

          SupportDialogue.findOne({ user: result._id }, (err, dialogue) => {
            if (!dialogue) {
              new SupportDialogue({
                user: result._id,
                unread: 1,
                messages: [message],
              }).save(() => {
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
      })
    }
  })

const sendCode = chatId => {
  const code = TwoFA.getCode(chatId)
  const expiration = TwoFA.getExpiration(code.at)

  Bot.sendMessage(
    chatId,
    '🔑 Here is the requested code for 2FA:\n\n' +
      code.code +
      `\n\nExpires in ${expiration} seconds.`,
  ).then(() => {})
}

const notifyManager = (user, message) => {
  if (user && user.bindedTo) {
    User.findOne({ email: user.bindedTo }, 'telegram', (err, manager) => {
      if (manager.telegram.loggedIn) {
        Bot.sendMessage(manager.telegram.chatId, message)
      }
    })
  }
}

Bot.onText(/\/code/, msg => {
  const id = msg.chat.id

  User.findOne({ 'telegram.chatId': id }, 'telegram', (err, user) => {
    if (user) {
      if (user.telegram.twoFa) {
        sendCode(msg.chat.id)
      } else {
        Bot.sendMessage(
          id,
          "🔓 You don't have 2FA enabled yet. Go to your profile on our website and turn that on.",
        )
      }
    } else {
      Bot.sendMessage(id, 'You are not authorized. Type /login EMAIL PASSWORD.')
    }
  })
})

Bot.onText(/\/logout/, (msg, match) => {
  const id = msg.chat.id

  User.findOne({ 'telegram.chatId': id }, 'telegram', (err, user) => {
    if (user) {
      user.telegram = {
        loggedIn: false,
        chatId: null,
        username: null,
      }
      user.save(() => {
        Bot.sendMessage(id, '✅ You have logged out.')
      })
    } else {
      Bot.sendMessage(id, '❌ You are not authorized yet.')
    }
  })
})

// Bot.onText(/\/login/, (msg, match) => {
//   Bot.send(msg.chat.id, 'Incorrect format of the command')
// })

Bot.onText(/\/login (.+) (.+)/, (msg, match) => {
  const id = msg.chat.id
  const email = match[1]
  const password = match[2]
  const passexp = /^[0-9A-Za-z#$%=@!{},`~&*()'<>?.:;_|^\/+\t\r\n\[\]"-]{6,32}$/

  if (!email.match('.+@.+')) {
    Bot.sendMessage(id, "❌ Please make sure you've entered a valid email.")
  } else if (!password.match(passexp)) {
    Bot.sendMessage(id, '❌ Password must contain 6 to 32 characters.')
  } else {
    Bot.sendChatAction(id, 'typing')

    User.find({}, 'telegram', (err, users) => {
      if (users) {
        for (let user of users) {
          if (user.telegram && user.telegram.chatId == id) {
            Bot.sendMessage(
              id,
              'You are already authorized. Type /logout to be able log in again.',
            )
            return
          }
        }
      }

      signIn(email, password)
        .then(user => {
          user.telegram = {
            loggedIn: true,
            username: msg.chat.username,
            chatId: id,
          }
          user.save(() => {
            if (user.role.name == 'user') {
              Bot.sendMessage(
                id,
                "✅ We're good to go! Now you will recieve codes.",
              )
            } else {
              Bot.sendMessage(
                id,
                "✅ We're good to go! Now I will send you codes and notifications.",
              )
            }
          })
        })
        .catch(error => {
          Bot.sendMessage(id, '❌ ' + error.message)
        })
    })
  }
})

Bot.onText(/(^[^/].+|\/start)/, message => {
  const replied = message.reply_to_message

  if (replied && replied.from.is_bot) {
    if (replied.entities) {
      for (let entity of replied.entities) {
        if (entity.type == 'email') {
          let { offset, length } = entity
          let email = replied.text.substring(offset, offset + length)
          let text = message.text

          sendSupportMessage(email, text)
            .then(message => {
              Bot.sendMessage(
                message.chat.id,
                `📨 Replied to ${email} with:\n\n«${text}»`,
              )
            })
            .catch(() => {
              Bot.sendMessage(
                message.chat.id,
                "❌ Something went wrong while you've tried to reply... Try again later.",
              )
            })

          break
        }
      }
    }
  } else {
    User.findOne(
      { 'telegram.chatId': message.chat.id },
      'role',
      (err, user) => {
        if (!user) {
          Bot.sendMessage(
            message.chat.id,
            '📝 First of all, let me memorize your profile.\nType /login EMAIL PASSWORD.',
          )
        } else if (user && user.role.name == 'user') {
          Bot.sendMessage(
            message.chat.id,
            '🔒 Sorry, but I can only help you with 2FA.',
          )
        } else if (user && user.role.name != 'user') {
          Bot.sendMessage(
            message.chat.id,
            '🗿 Sorry, but I can only help you with 2FA and notify about new support messages.',
          )
        }
      },
    )
  }
})

module.exports = {
  ...Bot,
  notifyManager,
  sendCode,
}

const axios = require('axios')
const parse5 = require('parse5')
const moment = require('moment')
const _ = require('underscore')

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
var ourMessages = {}

// function updateAvatar(id, name) {
// ourMessages
// }

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

    } catch (e) {
      console.log('ERROR: cant parse general messages', e)
    }

    setTimeout(updateYobitMessages, 1000)
  }).catch(err => {
    console.log(err)
  })
}

function getLobbyMessages(id) {
  return [...yobitMessages, ...(ourMessages[id] || [])].sort((a, b) => a.at - b.at)
}

function updateLobbies() {
  IO.sockets.sockets.forEach(socket => {
    let id = socket.handshake?.query?.id || socket.request.query?.id
    id = id == 'total' || !id ? socket.id : id
    socket.emit('set-messages', getLobbyMessages(id))
  })
}

updateYobitMessages()

module.exports = {
  init: io => {
    IO = io
    io.on('connection', socket => {
      let id = socket.handshake?.query?.id || socket.request.query?.id
      id = id == 'total' || !id ? socket.id : id

      socket.emit('set-messages', getLobbyMessages(id))

      socket.on('message', message => {
        if (!ourMessages[id]) ourMessages[id] = []
        ourMessages[id].push({ ...message, real: true })

        updateLobbies()
      })
    })
  }
}
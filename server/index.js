require('./utils/polyfill')
require('dotenv/config')
require('colors')

const fs = require('fs')
const path = require('path')
const express = require('express')
const http = require('http')
const https = require('https')
const session = require('express-session')
const compression = require('compression')
const app = express()

var privateKey = fs.readFileSync('server/ssl/server.key', 'utf8')
var certificate = fs.readFileSync('server/ssl/server.crt', 'utf8')

var credentials = { key: privateKey, cert: certificate }

const httpsServer = https.createServer(credentials, app)
const httpServer = http.createServer(app)

const socketio = require('socket.io')
const secureIO = socketio(httpsServer)
const IO = socketio(httpServer)

const TradeGuardChat = require('./trade-guard/chat')
const GeneralChat = require('./chat')
const TradingWSS = require('./trading/wss')

TradeGuardChat.defineIO({ secureIO, IO })
GeneralChat.init(IO)
TradingWSS.init({ secureIO, IO })

const bodyParser = require('body-parser')
const User = require('./models/User')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const launch = require('./utils/launchLog')

const slowDown = require('express-slow-down')
const globalSettings = require('./utils/globalSettings')

require('./telegram-bot')
require('./db-connect')
require('./wss')

const port = process.env.PORT || 8080

if (process.env.COMPRESSION) {
  app.use(compression({
    filter: (req, res) => req.headers['x-no-compression'] ? false : compression.filter(req, res)
  }))
}

if (!process.env.NO_FORCE_SSL) {
  app.use((req, res, next) => {
    const host = req.get('Host')

    if (
      req.headers['x-forwarded-proto'] !== 'https' &&
      host &&
      !host.startsWith('localhost')
    ) {
      return res.redirect(['https://', host, req.url].join(''))
    }

    return next()
  })
}

if (process.env.SLOWDOWN) {
  app.use('/api', slowDown({
    windowMs: 60 * 1000,
    delayAfter: 200,
    delayMs: 500,
  }))
}

app.use(
  session({
    secret: process.env.SECRET,
    saveUninitialized: false,
    resave: true,
  }),
)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/api', cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], optionsSuccessStatus: 200, }))


app.use('/api/auth', require('./routes/auth'))
app.use('/api/user', require('./routes/user'))
app.use('/api/wallet', require('./routes/wallet'))
app.use('/api/ref', (req, res, next) => {
  if (globalSettings.get('referralRaceDomains').includes(req.get('host'))) {
    next()
  } else {
    res.sendStatus(404)
  }
}, require('./routes/user/referralRace'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/support', require('./routes/support'))
app.use('/trade-guard', require('./trade-guard').router)

app.get('/api/ping', (req, res) => {
  res.send({
    referralRace: globalSettings.get('referralRaceDomains').includes(req.get('host'))
  })
})

app.use('/', (req, res, next) => {
  try {
    const token = req.session.auth.split(' ')[1]
    const user = jwt.verify(token, process.env.SECRET).user

    if (user.banned) res.end()
    else next()
  } catch {
    next()
  }
})

app.use('/r', express.static(path.join(__dirname, '../builds/moonbirds')))
app.use('/', express.static(path.join(__dirname, '../builds/website')))
app.use(express.static(path.join(__dirname, '../builds/admin')))

app.get(/^.*(\/admin|\/admin\/dashboard).*$/, (req, res) => {
  try {
    const token = req.session.auth.split(' ')[1]
    const userId = jwt.verify(token, process.env.SECRET).user

    User.findById(userId, (err, match) => {
      if (match) {
        console.log(
          ` ${match.role.name.toUpperCase()} `.bgBrightBlue.black +
          ` (` +
          `${match.email}`.cyan +
          `): Entered to Admin Dashboard`,
        )
      }

      if (match && match.role.name != 'user') {
        res.sendFile(path.join(__dirname, '../builds/admin/index.html'))
      } else {
        res.sendFile(path.join(__dirname, '../builds/website/index.html'))
      }
    })
  } catch (err) {
    res.sendFile(path.join(__dirname, '../builds/website/index.html'))
  }
})

app.get(/^.*(?!.*(\/admin|\/admin\/dashboard)).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../builds/website/index.html'))
})


httpServer.listen(port, () => launch.log(`Server is running on ${port}`))

if (process.env.PORT == 80) httpsServer.listen(443)

// require('./wss').connect(httpServer)
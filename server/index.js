const express = require('express')

const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path')
const User = require('./models/User')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const slowDown = require('express-slow-down')

require('dotenv/config')
require('colors')

const blackList = require('./user/blackList')
var blackListIPs = []

const updateBlackList = () => {
  blackList.get().then(data => {
    blackListIPs = data
    setTimeout(updateBlackList, 20000)
  })
}

const port = process.env.PORT || 8080
const env = process.env.NODE_ENV || 'development'
const app = express()

app.use(
  '/api',
  cors({
    origin: 'localhost:' + port,
    methods: ['GET', 'POST', 'OPTIONS'],
    optionsSuccessStatus: 200,
  }),
)

var forceSsl = function (req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https' && env == 'production') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''))
  }

  return next()
}

app.use(forceSsl)

const speedLimiter = slowDown({
  windowMs: 60 * 1000,
  delayAfter: 200,
  delayMs: 500,
})

app.use('/api', speedLimiter)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser(process.env.SECRET))

const authRoute = require('./routes/auth')
const userRoute = require('./routes/user')
const walletRoute = require('./routes/wallet')
const adminRoute = require('./routes/admin')
const supportRoute = require('./routes/support')

const Roles = require('./user/roles')
const launch = require('./launchLog')

app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)
app.use('/api/wallet', walletRoute)
app.use('/api/admin', adminRoute)
app.use('/api/support', supportRoute)

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useFindAndModify: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection

db.on('error', err => {
  launch.error('Database has ' + db.states[+db._readyState])
})

db.once('open', () => {
  launch.log('Database has ' + db.states[+db._readyState])

  if (process.env.UPDATE_ROLES) {
    Roles.updateUsersRoles().then(err => {
      if (err) console.log('err: ' + err)
      else launch.log('Users roles have been updated')
    })
  }

  updateBlackList()
})

app.use('/', (req, res, next) => {
  if (blackListIPs.includes(req.headers['x-forwarded-for'])) {
    res.sendStatus(403)
  } else {
    next()
  }
})

app.use('/', express.static(path.join(__dirname, '../site/dist')))
app.use(express.static(path.join(__dirname, '../admin/dist')))

app.get(/(?!\/api)\/admin(\/.*|$)/, (req, res) => {
  try {
    const token = req.cookies['Authorization'].split(' ')[1]
    const userId = jwt.verify(token, process.env.SECRET).user

    User.findById(userId, (err, match) => {
      if (match && match.role.name !== 'user') {
        res.sendFile(path.join(__dirname, '../admin/dist/index.html'))
      } else {
        res.sendFile(path.join(__dirname, '../site/dist/index.html'))
      }
    })
  } catch (err) {
    res.sendFile(path.join(__dirname, '../site/dist/index.html'))
  }
})

app.get(/.+(?!\/admin(\/.*|$))/, (req, res) => {
  res.sendFile(path.join(__dirname, '../site/dist/index.html'))
})

app.listen(port, () => launch.log(`Server is running on ${port}`))

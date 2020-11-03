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

const port = process.env.PORT || 8080
const app = express()

app.use(
  '/api',
  cors({
    origin: 'localhost:' + port,
    methods: ['GET', 'POST', 'OPTIONS'],
    optionsSuccessStatus: 200,
  }),
)


const speedLimiter = slowDown({
  windowMs: 60 * 1000,
  delayAfter: 100,
  delayMs: 500
});
 
app.use('/api', speedLimiter);

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
  launch.log('Database has ' + db.states[+db._readyState])
})

db.once('open', () => {
  launch.log('Database has ' + db.states[+db._readyState])

  if (process.env.UPDATE_ROLES) {
    Roles.updateUsersRoles().then(err => {
      if (err) console.log('err: ' + err)
      else launch.log('Users roles have been updated')
    })
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

app.listen(port, () =>
  launch.log(`Server is running on ${port}`),
)

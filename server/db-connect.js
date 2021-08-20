const mongoose = require('mongoose')
const launch = require('./utils/launchLog')
const Roles = require('./user/roles')

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
})
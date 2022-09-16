const fs = require('fs')

const PATH = './settings.json'

module.exports = {
  set(key, value) {
    try {
      let json = fs.readFileSync(PATH, { encoding: 'utf-8' })
      let settings = json ? JSON.parse(json) : {}

      if (value === 'true' || value === 'false') {
        settings[key] = value == 'true'
      } // TODO: implement the cases for other types

      fs.writeFileSync(PATH, JSON.stringify(settings, null, 2))
      return settings
    } catch (e) {
      console.log(e.message)
      return null
    }
  },
  get(key) {
    try {
      let settings = JSON.parse(fs.readFileSync(PATH, { encoding: 'utf-8' }))
      return settings[key]
    } catch (err) {
      return null
    }
  },
}
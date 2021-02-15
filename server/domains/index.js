const namecheap = require('./namecheap')
const launch = require('../launchLog')

async function main() {
  await namecheap.init()

  launch.log('Domains initializated')
}

async function assignDomain(domain, email) {
  try {
    await namecheap.setDNSRecords(domain, [
      {
        type: 'A',
        host: 'www',
        value: namecheap.getIP(),
      },
      {
        type: 'A',
        host: '@',
        value: namecheap.getIP(),
      },
    ])

    return { message: 'Domain was added and configured' }
  } catch (e) {
    if (e.response) {
      const msg = e.response.data.error.message

      throw new Error(msg)
    } else {
      const msg = e.message

      if (msg.startsWith('2019166')) {
        throw new Error('You have not purchased this domain')
      } else {
        throw e
      }
    }
  }
}

module.exports = {
  init: main,
  assignDomain,
  getIP: namecheap.getIP,
  getList: namecheap.getList
}

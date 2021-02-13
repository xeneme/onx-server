const namecheap = require('./namecheap')
const vercel = require('./vercel')

async function main() {
  await namecheap.init()
  await vercel.init()
}

async function assignDomain(domain, email) {
  try {
    await namecheap.setDNSRecords(domain, [
      {
        type: 'CNAME',
        host: 'www',
        value: 'cname.vercel-dns.com.',
      },
      {
        type: 'A',
        host: '@',
        value: namecheap.getIP(),
      },
    ])

    const pending = []

    pending.push(vercel.addDomain(domain))
    pending.push(vercel.addDomain('www.' + domain))

    await Promise.all(pending)

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
}

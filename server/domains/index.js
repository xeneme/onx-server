const nc = require('./namecheap')
const cf = require('./cloudflare')
const launch = require('../launchLog')

const Domain = require('../models/Domain')

const forwardEmailTo = process.env.OWNER

async function main() {
  await nc.init()
  await cf.init()

  launch.log('Domains initializated')
}

async function getManager(domain) {
  const d = await Domain.findOne({ name: domain })

  if (d) {
    return d.manager
  } else {
    return 'Nobody'
  }
}

async function getList() {
  const domains = (
    await nc.getList()
  ).response[0].DomainGetListResult[0].Domain.map(d => d.$)
  const domainsObjects = await Domain.find({})

  domains.forEach(domain => {
    const search = domainsObjects.filter(d => d.name == domain.Name)

    domain.Assigned = search.length ? search[0].manager : 'Nobody'
  })

  return domains
}

async function assignDomain(domain, email) {
  try {
    const manager = await getManager(domain)

    if (manager == 'Nobody') {
      await new Domain({
        name: domain,
        manager: email,
      }).save()

      const zone = (await cf.addZone(domain)).data.result

      // await cf.setFlexibleSSL(zone.id)

      const settingDNS = [
        nc.setCustomNameservers(domain, zone.name_servers),
        cf.addDNSRecord({
          zone: zone.id,
          type: 'A',
          name: '@',
          content: nc.getIP(),
        }),
        cf.addDNSRecord({
          zone: zone.id,
          type: 'A',
          name: 'www',
          content: nc.getIP(),
        }),
        cf.addDNSRecord({
          zone: zone.id,
          type: 'MX',
          name: '@',
          content: 'mx1.privateemail.com',
          priority: 10,
        }),
        cf.addDNSRecord({
          zone: zone.id,
          type: 'MX',
          name: '@',
          content: 'mx2.privateemail.com',
          priority: 10,
        }),
        cf.addDNSRecord({
          zone: zone.id,
          type: 'TXT',
          name: '@',
          content: 'v=spf1 include:spf.privateemail.com ~all',
        }),
      ]

      await Promise.all(settingDNS)
    } else {
      const domainObject = await Domain.findOne({ name: domain })
      domainObject.manager = email
      await domainObject.save(null)
    }

    return { message: 'Domain was added and configured' }
  } catch (e) {
    if (e.response) {
      console.log(e.response.data.errors[0].error_chain)
      const msg = e.response.data.errors[0].message

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

const parseDomain = url => {
  if (typeof url == 'string') {
    return new URL(url).hostname.replace('www.', '')
  } else {
    return new URL('https://' + url.headers.host).hostname.replace('www.', '')
  }
}

const getProjectName = url => {
  const capitalize = (str, lower = false) =>
    (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match =>
      match.toUpperCase(),
    )

  let name = parseDomain(url)
    .replace(/www\./, '')
    .replace(new RegExp('(.\\w+)$', 'g'), '')

  return name
    .replace(new RegExp('[_-]', 'g'), ' ')
    .split(' ')
    .map(w => capitalize(w))
    .join('')
}

module.exports = {
  init: main,
  assignDomain,
  getIP: nc.getIP,
  getList,
  getManager,
  parseDomain,
  getProjectName,
}

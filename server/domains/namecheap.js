const namecheapApi = require('namecheap-api')
const IP = require('./ip')

require('dotenv/config')

const API_USER = process.env.NAMECHEAP_API_USER
const API_KEY = process.env.NAMECHEAP_API_KEY
var CLIENT_IP = ''

async function main() {
  CLIENT_IP = await IP.get()

  namecheapApi.config.set('ApiUser', API_USER)
  namecheapApi.config.set('ApiKey', API_KEY)
  namecheapApi.config.set('UserName', API_USER)
  namecheapApi.config.set('ClientIp', CLIENT_IP)
}

async function query(command, params = {}, sandbox = true) {
  try {
    return await namecheapApi.apiCall(command, params, sandbox)
  } catch (err) {
    if (err.response) {
      throw new Error(err.response.message)
    } else {
      throw new Error(err)
    }
  }
}

async function getList() {
  return query('namecheap.domains.getList')
}

async function setCustomNameservers(domain, nameservers) {
  const [SLD, TLD] = domain.split('.')

  return query('dns.setCustom', {
    SLD,
    TLD,
    NameServers: nameservers.join(','),
  })
}

async function setDNSRecords(domain, records) {
  const [SLD, TLD] = domain.split('.')
  const parsedRecords = Object.assign(
    { SLD, TLD },
    ...records.map((r, i) => ({
      ['HostName' + (i + 1)]: r.host,
      ['RecordType' + (i + 1)]: r.type,
      ['Address' + (i + 1)]: r.value,
      ['TTL' + (i + 1)]: 60,
    })),
  )

  try {
    const data = await query('namecheap.domains.dns.setHosts', parsedRecords)
    const success =
      data.response[0].DomainDNSSetHostsResult[0].$.IsSuccess == 'true'
        ? true
        : false

    return success
  } catch (e) {
    throw new Error(e.message)
  }
}

module.exports = {
  init: main,
  getList,
  getIP: () => CLIENT_IP,
  setCustomNameservers,
  setDNSRecords,
}

const axios = require('axios')

var ACCOUNT_ID = ''

async function main() {
  ACCOUNT_ID = (await getAccounts()).data.result[0].id

  console.log(ACCOUNT_ID)
}

async function getAccounts() {
  return await query({
    path: 'accounts',
  })
}

async function getZones() {
  return await query({
    path: 'zones',
  })
}

async function getZone(domain) {
  try {
    return (await getZones()).data.result.filter(zone => zone.name == domain)[0]
  } catch {
    throw new Error('There is no zone for the provided domain')
  }
}

async function addZone(domain) {
  return await query({
    path: 'zones',
    method: 'post',
    body: {
      name: domain,
      account: {
        id: ACCOUNT_ID,
      },
      type: 'full',
    },
  })
}

async function createPageRule(domain) {
  let zone = await getZone(domain)

  console.log(zone)

  return true

  // await query({
  //   path: 'zones/',
  //   method: 'post',
  //   body: {
  //     name: domain,
  //     account: {
  //       id: ACCOUNT_ID,
  //     },
  //     type: 'full',
  //   },
  // })
}

function query({ path, body = {}, method = 'get' }) {
  return axios({
    url: 'https://api.cloudflare.com/client/v4/' + path,
    method,
    data: body,
    headers: {
      'X-Auth-Key': process.env.CLOUDFLARE_API_KEY,
      'X-Auth-Email': process.env.CLOUDFLARE_EMAIL,
    },
  })
}

module.exports = {
  init: main,
  getAccounts,
  getZones,
  addZone,
}

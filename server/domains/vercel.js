const axios = require('axios')

const headers = {
  Authorization: 'Bearer ' + process.env.VER_API_KEY,
}

var project_id = ''

async function main() {
  project_id = (await getFirstProject()).id
}

async function query({ method, data, params, path, version = 4 }) {
  return axios({
    method,
    url: `https://api.vercel.com/v${version}/` + path,
    headers,
    data,
    params,
  })
}

async function getProjects() {
  return query({
    method: 'get',
    path: 'projects',
  })
}

async function getFirstProject() {
  const data = (await getProjects()).data

  return data.projects[0]
}

async function addDomain(domain) {
  try {
    await query({
      method: 'post',
      version: 1,
      path: 'projects/' + project_id + '/alias',
      data: {
        domain,
      },
    })

    return 'OK'
  } catch (e) {
    throw e
  }
}

async function status(domain) {
  return query({
    method: 'get',
    path: 'domains',
    params: {
      status: domain,
    },
  })
}

module.exports = {
  init: main,
  addDomain,
}

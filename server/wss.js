const launch = require('./utils/launchLog')
const history = require('./trading/history')
const orderBook = require('./trading/orderBook')

const ws = require('ws').Server
const port = 9090

module.exports = {
  connect(server) {
    const wss = new ws({ server }, () => {
      launch.log(`WSS is running`)
    });

    const parseQuery = req => {
      try {
        req.query = Object.fromEntries(req.url.split('?')[1]?.split('&').map(el => [...el.split('=')]))
      } catch { }
    }

    wss.on('connection', (socket, req) => {
      parseQuery(req)
      socket.query = req.query

      if (req.url.startsWith('/trading')) {
        if (!req.query) return
        let { range, symbol } = req.query
        const state = history.getState()
        if (state[range] && state[range][symbol]) {
          socket.send(JSON.stringify(history.getState()[range][symbol]))
        }
        history.subscribe(socket)
        orderBook.subscribe(socket)
      }
    });
  },
}
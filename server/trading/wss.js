const launch = require('../utils/launchLog')
const history = require('../trading/history')
const orderBook = require('../trading/orderBook')

module.exports = {
  init({ secureIO, IO }) {
    launch.log('Trading WS is running')

    const onConnect = socket => {
      socket.query = socket.handshake.query

      if (!socket.handshake.query) return
      let { range, symbol } = socket.handshake.query
      const state = history.getState()
      if (state[range] && state[range][symbol]) {
        socket.emit('set-trading-data', history.getState()[range][symbol])
      }
      history.subscribe(socket)
      orderBook.subscribe(socket)
    }

    secureIO.on('connection', onConnect)
    IO.on('connection', onConnect)
  },
}
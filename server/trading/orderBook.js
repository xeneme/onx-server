const history = require('./history').getState();

const symbols = ['BTC', 'ETH', 'LTC', 'XRP']
const orders = {}
var subs = []

function filterOpenSockets() {
  subs.forEach(socket => {
    subs = subs.filter(s => !socket._closeFrameReceived)
  })
}

function placeOrder(symbol) {
  if (!orders[symbol]) orders[symbol] = []
  if (!history['15m'] || !history['15m'][symbol]) return

  let [_, price] = history['15m'][symbol][history['15m'][symbol].length - 1]

  const randAmountMap = {
    'BTC': {
      min: 0.003,
      mid: 0.08,
      max: 0.23,
      zeros: 6
    },
    'LTC': {
      min: 0.05,
      mid: 4,
      max: 12.5,
      zeros: 5
    },
    'ETH': {
      min: 0.002,
      mid: 2,
      max: 5.2,
      zeros: 5
    },
    'XRP': {
      min: 4,
      mid: 80,
      max: 500,
      zeros: 1
    },
  }

  let amount = (Math.random() * Math.random()) / 10
  let { min, mid, max, zeros } = randAmountMap[symbol]

  if (Math.random() > 0.8) amount = min + Math.random() * mid
  else amount = min + Math.random() * max

  let order = {
    action: Math.random() > 0.5 ? 'sell' : 'buy',
    price,
    amount: +amount.toFixed(zeros),
    ts: +new Date(),
  }

  orders[symbol].push(order)

  if (orders[symbol].length > 100) orders[symbol].shift()
}

function main() {
  symbols.forEach(symbol => {
    placeOrder(symbol)
  })

  subs.forEach(socket => {
    socket.send(JSON.stringify({ orders: orders[socket.query.symbol] }))
  })

  setTimeout(main, Math.random() * 850 + 150)
}

main()


module.exports = {
  subscribe: socket => {
    filterOpenSockets()
    subs.push(socket)
  }
}
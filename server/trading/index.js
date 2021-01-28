const Market = require('../crypto/market')

var orders = {
  BTC: [],
  LTC: [],
  ETH: [],
  DOT: [],
  LINK: [],
  XRP: [],
}
var priceList = {}
var history = { ...orders }
var coins = [
  ['BTC', 'bitcoin'],
  ['LTC', 'litecoin'],
  ['ETH', 'ethereum'],
  ['DOT', 'polkadot'],
  ['LINK', 'chainlink'],
  ['XRP', 'ripple'],
]

var graphPricesQeue = {
  BTC: [],
  LTC: [],
  ETH: [],
  DOT: [],
  LINK: [],
  XRP: [],
}

function chunkNum(n, times, shuffle) {
  const d = n / times

  let res = []

  for (let i = 0; i < times; i++) {
    res.push(d)
  }

  for (let i = 0; i < shuffle; i++) {
    let f = Math.floor(Math.random() * res.length)
    let t = Math.floor(Math.random() * res.length)

    let temp = (res[f] / 2) * Math.random()

    res[f] -= temp
    res[t] += temp
  }

  return res
}

function addPriceToQueue(coin, direction, CHANGE_PERCENT) {
  CHANGE_PERCENT += (Math.random() / 2) * (Math.random() > 0.5 ? 1 : -1)

  const CHANGE_PERCENTS = chunkNum(
    CHANGE_PERCENT,
    Math.floor(CHANGE_PERCENT) / 3,
    10,
  )

  // console.log(CHANGE_PERCENTS)

  const hist = history[coin]['1h']

  // for (let p of CHANGE_PERCENTS) {
  const qeue = graphPricesQeue[coin]

  const firstQeued = qeue.length ? qeue[qeue.length - 1] : null

  let last = firstQeued || hist[hist.length - 1][1]

  let change = last * (CHANGE_PERCENT / 100)
  let newVal = direction == 'up' ? last + change : last - change

  graphPricesQeue[coin].push(newVal)
  // }
}

function applyFakedHistory() {
  const canBeFaked = coins.map(c => c[0]).filter(c => history[c])

  canBeFaked.forEach(c => {
    const h = history[c]['1h']

    if (!h) return

    const lastTs = h[h.length - 1][0]

    if (!graphPricesQeue[c].length || lastTs + 113598 > +new Date()) return

    const fakePrice = graphPricesQeue[c].shift()

    const el = [lastTs + 113598, fakePrice]

    Object.keys(history[c]).forEach(range => {
      history[c][range].shift()
      history[c][range].push(el)
    })
  })
}

async function updateHistory() {
  for (let [net, currency] of coins) {
    const data = await Market.allHistory(currency)

    if (!history[net]['1h']) {
      history[net] = data
    } else {
      const h = history[net]['1h']
      const lastTs = h[h.length - 1][0]

      Object.keys(data).forEach(range => {
        const newPoints = data[range].filter(point => point[0] > lastTs)
        history[net][range].push(...newPoints)
      })
    }
  }

  setTimeout(updateHistory, 3 * 60000)
}

function updatePrice() {
  Market.currentPrice().then(data => {
    data.forEach(coin => {
      priceList[coin.id] = coin.price
    })

    orders.BTC.splice(0, 0, placeNewOrder('bitcoin'))
    orders.LTC.splice(0, 0, placeNewOrder('litecoin'))
    orders.ETH.splice(0, 0, placeNewOrder('ethereum'))
    orders.DOT.splice(0, 0, placeNewOrder('polkadot'))
    orders.LINK.splice(0, 0, placeNewOrder('chainlink'))
    orders.XRP.splice(0, 0, placeNewOrder('ripple'))

    if (orders.BTC.length > 100) orders.BTC.pop()
    if (orders.LTC.length > 100) orders.LTC.pop()
    if (orders.ETH.length > 100) orders.ETH.pop()
    if (orders.DOT.length > 100) orders.DOT.pop()
    if (orders.LINK.length > 100) orders.LINK.pop()
    if (orders.XRP.length > 100) orders.XRP.pop()
  })
}

updateHistory()
setInterval(updatePrice, 900)
setInterval(applyFakedHistory, 4000)

function randomDelay() {
  return Math.random() * 2000 + 200
}

function placeNewOrder(currency) {
  var price = priceList[currency]
  var amount = (Math.random() * Math.random()) / 10
  var t = new Date()

  if (Math.random() > 0.9) amount += 1
  else if (Math.random() > 0.9) amount += 0.1

  return {
    price,
    amount: amount.toFixed(10),
    time:
      (t.getHours() < 10 ? '0' + t.getHours() : t.getHours()) +
      ':' +
      (t.getMinutes() < 10 ? '0' + t.getMinutes() : t.getMinutes()) +
      ':' +
      (t.getSeconds() < 10 ? '0' + t.getSeconds() : t.getSeconds()),
    action: Math.random() > 0.5 ? 'buy' : 'sell',
  }
}

module.exports = {
  addPriceToQueue,
  getOrders: () => orders,
  getHistory: () => history,
  randomDelay,
}

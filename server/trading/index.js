const market = require('../crypto/market')

var priceList = {}
var orders = {
  BTC: [],
  LTC: [],
  ETH: [],
  DOT: [],
  LINK: [],
  XRP: [],
}

const updatePrice = () => {
  market.currentPrice().then(data => {
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

setInterval(updatePrice, 900)

const randomDelay = () => Math.random() * 2000 + 200
const getOrders = () => orders
const placeNewOrder = currency => {
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
  getOrders,
  randomDelay,
}

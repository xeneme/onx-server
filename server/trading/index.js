const Market = require('../crypto/market')
const history = require('./history')

var Data = {
  orders: {
    BTC: [],
    LTC: [],
    ETH: [],
    DOT: [],
    LINK: [],
    XRP: [],
  },
  history: {},
  realHistory: {},
},
  priceList = {},
  coins = [
    ['BTC', 'bitcoin'],
    ['LTC', 'litecoin'],
    ['ETH', 'ethereum'],
    ['DOT', 'polkadot'],
    ['LINK', 'chainlink'],
    ['XRP', 'ripple'],
  ]

const Graph = {
  async addLobbyHistory(lobby) {
    Data.history[lobby] = {
      BTC: [],
      LTC: [],
      ETH: [],
      DOT: [],
      LINK: [],
      XRP: [],
    }

    await Graph.updateHistory(lobby)

    return Data.history[lobby]
  },
  getHistory(lobby) {
    return { lobby, history: Data.history[lobby] }
  },
  async updateAllHistory() {
    const lobbies = Object.keys(Data.history)

    for (let lobby of lobbies) {
      await Graph.updateHistory(lobby)
    }
  },
  async updateHistory(lobby) {
    const historyInstance = Data.history[lobby]
    const real = Graph.getRealHistory()

    for (let net of coins.map(c => c[0])) {
      if (!historyInstance[net]['1h']) {
        historyInstance[net] = real[net]
      } else {
        const h = historyInstance[net]['1h']
        const lastTs = h[h.length - 1][0]

        Object.keys(historyInstance[net]).forEach(range => {
          const newPoints = historyInstance[net][range].filter(
            point => point[0] > lastTs,
          )
          historyInstance[net][range].push(...newPoints)
        })
      }
    }
  },
  getRealHistory() {
    return JSON.parse(JSON.stringify(Data.realHistory))
  },
}

const Orders = {
  updatePrice() {
    Market.currentPrice().then(data => {
      Orders.latestMarketPrice = data
    })
  },
  createOrder() {
    Orders.latestMarketPrice.forEach(coin => {
      priceList[coin.id] = coin.price
    })

    Data.orders.BTC.splice(0, 0, Orders.placeNewOrder('bitcoin'))
    Data.orders.LTC.splice(0, 0, Orders.placeNewOrder('litecoin'))
    Data.orders.ETH.splice(0, 0, Orders.placeNewOrder('ethereum'))
    Data.orders.DOT.splice(0, 0, Orders.placeNewOrder('polkadot'))
    Data.orders.LINK.splice(0, 0, Orders.placeNewOrder('chainlink'))
    Data.orders.XRP.splice(0, 0, Orders.placeNewOrder('ripple'))

    if (Data.orders.BTC.length > 100) Data.orders.BTC.pop()
    if (Data.orders.ETH.length > 100) Data.orders.ETH.pop()
    if (Data.orders.LTC.length > 100) Data.orders.LTC.pop()
    if (Data.orders.DOT.length > 100) Data.orders.DOT.pop()
    if (Data.orders.LINK.length > 100) Data.orders.LINK.pop()
    if (Data.orders.XRP.length > 100) Data.orders.XRP.pop()
  },
  placeNewOrder(currency) {
    const randomDict = {
      'bitcoin': {
        min: 0.003,
        mid: 0.08,
        max: 0.23,
        zeros: 6
      },
      'litecoin': {
        min: 0.05,
        mid: 4,
        max: 12.5,
        zeros: 5
      },
      'ethereum': {
        min: 0.002,
        mid: 2,
        max: 5.2,
        zeros: 5
      },
      'polkadot': {
        min: 0.03,
        mid: 5,
        max: 15,
        zeros: 2
      },
      'chainlink': {
        min: 0.02,
        mid: 4,
        max: 20,
        zeros: 2
      },
      'ripple': {
        min: 4,
        mid: 80,
        max: 500,
        zeros: 1
      },
    }

    var price = priceList[currency]
    var amount = (Math.random() * Math.random()) / 10
    var t = new Date()

    if (Math.random() > 0.8) amount = randomDict[currency].min + Math.random() * randomDict[currency].mid
    else amount = randomDict[currency].min + Math.random() * randomDict[currency].max

    return {
      price,
      amount: amount.toFixed(randomDict[currency].zeros),
      time:
        (t.getHours() < 10 ? '0' + t.getHours() : t.getHours()) +
        ':' +
        (t.getMinutes() < 10 ? '0' + t.getMinutes() : t.getMinutes()) +
        ':' +
        (t.getSeconds() < 10 ? '0' + t.getSeconds() : t.getSeconds()),
      action: Math.random() > 0.5 ? 'buy' : 'sell',
    }
  },
}

module.exports = {
}

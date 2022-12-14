const moment = require('moment')
const _ = require('underscore')
const fs = require('fs')
const CoinGecko = require('coingecko-api')
const CoinGeckoClient = new CoinGecko()

var userCharts = {}

const normalize = (array, toMin, toMax) => {
  toMin = Math.min(toMin, toMax)
  toMax = Math.max(toMin, toMax)

  let delta = toMax - toMin

  let min = array.min()
  let max = array.max()

  return array.map(value => {
    let n = (value - min) / (max - min)
    return delta * n + toMin
  })
}

const getLinearChart = (maxChartX, maxChartY, data) => {
  var points = data
  var dataPoints = ''

  var min = points.map(point => point[1]).min()
  var max = points.map(point => point[1]).max()

  points = normalize(
    points.map(point => maxChartY - point[1]),
    0,
    maxChartY,
  )

  min = points.min()
  max = points.max()

  points.forEach((point, i) => {
    dataPoints += `${Math.floor(
      (maxChartX / points.length) * i + maxChartX / points.length / 2,
    )},${(Math.floor((point / max) * maxChartY) + 25) || 1} `
  })

  return dataPoints
}

function subdivideGraph(arr, subs) {
  let res = []

  for (let i = 0; i < arr.length; i++) {
    res.push(arr[i])

    let [t, v] = arr[i]

    if (!arr[i + 1]) return res

    let [t2, v2] = arr[i + 1]

    let tstep = (t2 - t) / subs
    let vstep = (v2 - v) / subs
    let subT = t
    let subV = v

    for (let s = 0; s < subs; s++) {
      let r = Math.random() * (vstep * 4) * (Math.random() > 0.5 ? -1 : 1)
      subV += vstep
      subT += tstep
      if (subV != v2 && subT != t2) {
        res.push([Math.floor(subT), subV + r])
      }
    }
  }

  return res
}

async function historyLinearChart(coin) {
  try {
    let data = await CoinGeckoClient.coins.fetchMarketChart(coin, {
      days: 1,
      vs_currency: 'usd',
    })

    const history = await data.data.prices.map((price, i) => {
      price[0] = i
      return price
    })

    return {
      coin,
      raw: history,
      range: '24h',
      points: getLinearChart(200, 50, history),
    }
  } catch (e) {
    return null
  }
}

async function updateUserCharts() {
  const availableCoins = ['bitcoin', 'litecoin', 'ethereum', 'usd-coin']
  const charts = availableCoins.map(c => historyLinearChart(c))

  Promise.all(charts)
    .then(chartData => {
      userCharts = chartData
    })
    .catch(e => {
      console.log(e.message)
    })
}

setTimeout(() => {
  updateUserCharts().then(() => {
    console.log('\n  => Market Module: user charts are loaded\n')
  })
}, 4000)

setInterval(updateUserCharts, 10 * 60000)

module.exports = {
  subdivideGraph,
  currentPrice: async () => {
    let data = await CoinGeckoClient.coins.all()
    return await data.data.map(coin => ({
      id: coin.id,
      price: coin.market_data.current_price.usd,
    }))
  },
  allHistory: async coin => {
    const ts = moment().unix()
    const h = 60 * 60
    const d = h * 24
    const w = d * 7
    const m = d * 30

    let hour = await CoinGeckoClient.coins.fetchMarketChartRange(coin, {
      from: ts - h,
      to: ts,
      vs_currency: 'usd',
    })

    let day = await CoinGeckoClient.coins.fetchMarketChartRange(coin, {
      from: ts - d,
      to: ts,
      vs_currency: 'usd',
    })

    let week = await CoinGeckoClient.coins.fetchMarketChartRange(coin, {
      from: ts - w,
      to: ts,
      vs_currency: 'usd',
    })

    let month = await CoinGeckoClient.coins.fetchMarketChartRange(coin, {
      from: ts - m,
      to: ts,
      vs_currency: 'usd',
    })

    let threeMonths = await CoinGeckoClient.coins.fetchMarketChartRange(coin, {
      from: ts - m * 3,
      to: ts,
      vs_currency: 'usd',
    })

    let year = await CoinGeckoClient.coins.fetchMarketChartRange(coin, {
      from: ts - m * 12,
      to: ts,
      vs_currency: 'usd',
    })

    let all = await CoinGeckoClient.coins.fetchMarketChartRange(coin, {
      from: ts - 5 * (m * 12),
      to: ts,
      vs_currency: 'usd',
    })

    return {
      '1h': subdivideGraph(hour.data.prices, 4),
      '1d': day.data.prices,
      '1w': week.data.prices,
      '1m': month.data.prices,
      '3m': threeMonths.data.prices,
      '1y': year.data.prices,
      all: all.data.prices,
    }
  },
  userCharts: () => userCharts,
}

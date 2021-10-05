const moment = require('moment')

module.exports = client => {
  let PRICES = {
    bitcoin: [],
    litecoin: [],
    ethereum: [],
    'usd-coin': [],
  }


  async function fetchMarketChart(coin) {
    let result = await client.coins.fetchMarketChart(coin, {
      days: 30,
      vs_currency: 'usd',
    })
    return [coin, result.data.prices]
  }

  async function startUpdatingPrices() {
    pendingData = Object.keys(PRICES).map(coin => fetchMarketChart(coin))
    PRICES = Object.fromEntries(await Promise.all(pendingData))
    setTimeout(startUpdatingPrices, 60000 * 5)
  }

  async function getMonthHistory(coin, transactions) {
    coin = coin.replace(' ', '-')
    if (!PRICES[coin].length) throw Error('No market data is found')

    let result = []
    let balance = 0
    let handledTransactions = []

    PRICES[coin].forEach(([priceAt, price]) => {
      transactions.forEach(({ at: transactionDate, amount }) => {
        if (transactionDate < priceAt && !handledTransactions.includes(transactionDate)) {
          handledTransactions.push(transactionDate)
          balance += amount
        } else if (handledTransactions.length) {
          result.push([priceAt, price * balance])
        } else {
          result.push([priceAt, 0])
        }
      })
    })

    return result
  }

  startUpdatingPrices().then(() => {
    console.log('\n  => Balance Module: prices are fetched\n')
  })

  return {
    getMonthHistory
  }
}
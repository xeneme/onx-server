Array.prototype.max = function () {
  return Math.max.apply(null, this)
}

Array.prototype.min = function () {
  return Math.min.apply(null, this)
}

String.prototype.capitalize = function () {
  return this[0].toUpperCase() + this.substr(1)
}

String.prototype.toSymbol = function () {
  return {
    bitcoin: 'BTC',
    litecoin: 'LTC',
    ethereum: 'ETH',
    'usd coin': 'USDC',
  }[this.toLowerCase()]
}

String.prototype.toCurrency = function (lower) {
  return {
    BTC: lower ? 'bitcoin' : 'Bitcoin',
    LTC: lower ? 'litecoin' : 'Litecoin',
    ETH: lower ? 'ethereum' : 'Ethereum',
    USDC: lower ? 'usd coin' : 'Usd coin',
  }[this.toUpperCase()]
}

Promise.prototype.delay = function (miliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, miliseconds)
  })
}

module.exports = {}
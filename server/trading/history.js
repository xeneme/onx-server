const axios = require('axios');
const WebSocket = require('ws');

const state = {}
var subs = []

const symbols = ['BTC', 'ETH', 'LTC', 'XRP', 'USDC']
const ranges = {
  '15m': {
    interval: 'minute',
    limit: 15
  },
  '1H': {
    interval: 'minute',
    limit: 60
  },
  '1D': {
    interval: 'minute',
    limit: 1440
  },
  '5D': {
    interval: 'hour',
    limit: 120
  },
  '1M': {
    interval: 'hour',
    limit: 720
  },
  '3M': {
    interval: 'day',
    limit: 90
  },
  '6M': {
    interval: 'day',
    limit: 180
  },
  '1Y': {
    interval: 'day',
    limit: 360
  },
  '5Y': {
    interval: 'day',
    limit: 1800
  },
  'All': {
    interval: 'day',
    limit: 2000
  },
}

function filterOpenSockets() {
  subs.forEach(socket => {
    subs = subs.filter(s => !socket._closeFrameReceived)
  })
}

function emit(sym) {
  filterOpenSockets()
  subs.forEach(socket => {
    if (!socket.query) return
    let { range, symbol } = socket.query
    if (state[range] && state[range][symbol] && sym == symbol) {
      socket.emit('set-trading-data', state[range][symbol])
    }
  })
}

async function getHistory(symbol, interval, limit) {
  let params = {
    interval,
    limit,
    fsym: symbol,
    tsym: 'USD',
  }

  let response = await axios.get(
    `https://min-api.cryptocompare.com/data/v2/histo${params.interval}?fsym=${params.fsym}&tsym=${params.tsym}&limit=${params.limit}`,
    {
      headers: {
        authorization: 'Apikey ' + process.env.CRYPTOCOMPARE_API_KEY,
      },
    }
  )

  return response.data.Data.Data.map((p) => [p.time * 1000, p.close])
}

async function getAllHistory() {
  let startDate = new Date()

  for (let range of Object.keys(ranges)) {
    for (let sym of symbols) {
      let { interval, limit } = ranges[range]
      if (!state[range]) state[range] = {}
      state[range][sym] = await getHistory(sym, interval, limit)
    }
  }

  let duration = Math.abs(startDate - new Date()) / 1000
  console.log(`Got all price history in ${duration}s`)
}

function createTickers() {
  const createTicker = async (symbol) => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1m`);

    const pushPrice = (symbol, range, ts, price) => {
      if (!state[range] || !state[range][symbol]) return
      state[range][symbol].shift()
      state[range][symbol].push([ts, price])
      emit({ symbol, range, ts, price, update: true })
    }

    ws.on('message', async (data) => {
      let incomingData = JSON.parse(data.toString());
      if (incomingData.k) {
        let isClosed = incomingData.k.x;
        let symbolPrice = +incomingData.k.c;

        let sym = symbol.replace('usdt', '').toUpperCase()
        let ts = incomingData.k.t;

        if (isClosed) {
          ['15m', '1H', '1D',].forEach(r => pushPrice(sym, r, ts, symbolPrice)) // minute

          if (new Date(ts).getMinutes() == 0) { // hour
            ['5D', '1M', '3M',].forEach(r => pushPrice(sym, r, ts, symbolPrice))
          } else if (new Date(ts).getHours() == 0) {  // day
            ['6M', '1Y', '5Y', 'All'].forEach(r => pushPrice(sym, r, ts, symbolPrice))
          }

          emit(sym)
        }
      }
    });
  }

  for (let sym of symbols) {
    createTicker(sym.toLowerCase() + 'usdt');
  }
}


getAllHistory()
createTickers()


module.exports = {
  getState: () => state,
  subscribe: socket => {
    filterOpenSockets()
    // console.log('subscribe', socket.query, subs.length)
    subs.push(socket)
  }
}

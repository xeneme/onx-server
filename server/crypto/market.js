const moment = require('moment');
const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();
const Spline = require('cubic-spline');

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

const normalize = (array, toMin, toMax) => {
  toMin = Math.min(toMin, toMax);
  toMax = Math.max(toMin, toMax);

  let delta = toMax - toMin;

  let min = array.min();
  let max = array.max();

  return array.map(value => {
    let n = (value - min) / (max - min);
    return delta * n + toMin;
  });
};

const getLinearChart = (maxChartX, maxChartY, data) => {
  var points = data;
  var dataPoints = '';

  var min = points.map(point => point[1]).min();
  var max = points.map(point => point[1]).max();

  var timeline = points.map(point => point[0]);

  points = normalize(points.map(point => maxChartY - point[1]), 0, maxChartY)

  // var interpolated = new Spline(timeline, points);
  // points = points.map((point, i) => interpolated.at(i * 0.1));

  min = points.min();
  max = points.max();

  points.forEach((point, i) => {
    dataPoints += `${Math.floor(
      (maxChartX / points.length) * i + maxChartX / points.length / 2,
    )},${Math.floor((point / max) * maxChartY) + 25} `;
  });

  return dataPoints;
};

module.exports = {
  currentPrice: async () => {
    let data = await CoinGeckoClient.coins.all();
    return await data.data
      .map(coin => ({
        id: coin.id,
        price: coin.market_data.current_price.usd,
      }))
      // .filter(coin => ['bitcoin', 'litecoin', 'ethereum'].includes(coin.id));
  },
  historyLinearChart: async coin => {
    const t1 = moment().unix() - 60 * 60 * 24;
    const t2 = moment().unix();

    let data = await CoinGeckoClient.coins.fetchMarketChartRange(coin, {
      from: t1,
      to: t2,
      vs_currency: 'usd',
    });

    const history = await data.data.prices.map((price, i) => {
      price[0] = i;
      return price;
    });

    return {
      coin,
      raw: history,
      range: '24h',
      points: getLinearChart(200, 50, history),
    };
  },
};

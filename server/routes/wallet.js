const express = require('express');
const router = new express.Router();
const UserMiddleware = require('../user/middleware');
const CryptoMarket = require('../crypto/market');

const availableCoins = ['bitcoin', 'litecoin', 'ethereum'];

router.get('/price_history', (req, res) => {
    const charts = availableCoins.map(coin => CryptoMarket.historyLinearChart(coin))

    Promise.all(charts).then(data => res.send(data))    
})

module.exports = router;

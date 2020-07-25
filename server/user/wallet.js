const jwt = require('jsonwebtoken');
const Client = require('coinbase/lib/Client');
const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();

const CoinbaseClient = new Client({
  apiKey: process.env.COINBASE_KEY,
  apiSecret: process.env.COINBASE_SECRET,
  strictSSL: false,
  version: '2020-06-30',
});

var wallets = [];
var accounts = [];
var currentPriceList = [];

CoinbaseClient.getAccounts(null, (err, accs) => {
  accs.forEach(acc => {
    wallets.push({
      id: acc.id,
      balance: acc.balance,
      currency: acc.currency,
    });
  });

  accounts.push(...accs);

  console.log('The wallets has been fetched!');
});

const currentPrice = async () => {
  let data = await CoinGeckoClient.coins.all();
  return await data.data
    .map(coin => ({
      id: coin.id,
      price: coin.market_data.current_price.usd,
    }))
    .filter(coin => ['bitcoin', 'litecoin', 'ethereum'].includes(coin.id));
};

currentPrice().then(price => {
  currentPriceList = price;
  console.log('And a list of current prices fetched as well.');
});

module.exports = {
  verify: hashedWallets =>
    hashedWallets
      .map(hashedWallet => jwt.verify(hashedWallet, process.env.SECRET))
      .map(wallet => {
        return {
          address: wallet.address,
          currency: wallet.currency,
          currentPrice: wallet.currentPrice,
          balance: 0,
        };
      }),
  createAddresses: email => {
    return new Promise(resolve => {
      var addresses = [];

      accounts.forEach(account => {
        account.createAddress(
          {
            name: `${email}`,
          },
          (err, newAddress) => {
            if (!err) {
              const address = newAddress.deposit_uri.split(':')[1];
              const currency = newAddress.deposit_uri.split(':')[0];
              addresses.push({
                id: newAddress.id,
                address,
                currency,
                currentPrice: currentPriceList.filter(
                  coin => coin.id == currency,
                )[0].price,
                balance: 0,
              });

              if (addresses.length == wallets.length) {
                const hashedAddresses = addresses.map(newAddress =>
                  jwt.sign(newAddress, process.env.SECRET),
                );

                resolve(hashedAddresses);
              }
            } else {
              console.log(err);
              new Error(err);
            }
          },
        );
      });
    });
  },
};

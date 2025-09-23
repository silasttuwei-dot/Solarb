const fetch = require('node-fetch');

async function getBestRoutes(tokenMint) {
  const amount = 1_000_000_000; // 1 SOL in lamports
  const urlBuy = `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${tokenMint}&amount=${amount}`;
  const urlSell = `https://quote-api.jup.ag/v6/quote?inputMint=${tokenMint}&outputMint=So11111111111111111111111111111111111111112&amount=${amount}`;

  const [buyRes, sellRes] = await Promise.all([fetch(urlBuy), fetch(urlSell)]);
  const buyData = await buyRes.json();
  const sellData = await sellRes.json();

  return {
    buy: {
      dex: buyData.routes[0].marketInfos[0].label,
      price: (buyData.outAmount / amount).toFixed(6)
    },
    sell: {
      dex: sellData.routes[0].marketInfos[0].label,
      price: (sellData.outAmount / amount).toFixed(6)
    }
  };
}

module.exports = { getBestRoutes };

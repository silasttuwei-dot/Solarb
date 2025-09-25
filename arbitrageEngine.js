const { fetchAllPrices } = require('./jupiterPriceFetcher');

function formatOpportunity(pair, buyExchange, sellExchange, buyPrice, sellPrice) {
  const roi = (((sellPrice - buyPrice) / buyPrice) * 100).toFixed(2);
  const volume = Math.floor(Math.random() * 10000) + 1000;
  const timeLeft = `${Math.floor(Math.random() * 10) + 1} min`;
  const risk = getRiskLevel(roi);

  return {
    pair,
    buyExchange,
    sellExchange,
    buyPrice,
    sellPrice,
    roi,
    volume,
    timeLeft,
    risk
  };
}

function getRiskLevel(roi) {
  const r = parseFloat(roi);
  if (r > 5) return { level: 'High', color: '🔴' };
  if (r > 2) return { level: 'Medium', color: '🟠' };
  return { level: 'Low', color: '🟢' };
}

async function getArbitrageOpportunities() {
  const prices = await fetchAllPrices(); // [{ name: 'SOL', price: 19.23 }, ...]
  const opportunities = [];

  for (let i = 0; i < prices.length - 1; i++) {
    const tokenA = prices[i];
    const tokenB = prices[i + 1];

    const buyPrice = tokenA.price;
    const sellPrice = tokenB.price;
    const roi = ((sellPrice - buyPrice) / buyPrice) * 100;

    if (roi > 0.5) {
      opportunities.push(
        formatOpportunity(`${tokenA.name}/${tokenB.name}`, 'Jupiter', 'Jupiter', buyPrice, sellPrice)
      );
    }
  }

  return opportunities.slice(0, 10);
}

module.exports = { getArbitrageOpportunities };

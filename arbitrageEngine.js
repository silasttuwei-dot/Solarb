// arbitrageEngine.js
const {
  fetchJupiterPrices,
  fetchRaydiumPairs,
  fetchOrcaPools,
  fetchSerumMarkets
} = require('./dexFetchers');

function calculateROI(buyPrice, sellPrice) {
  return ((sellPrice - buyPrice) / buyPrice) * 100;
}

function scoreRisk(roi, volume) {
  if (roi > 3 && volume > 10000) return { level: 'Low', color: '🟢' };
  if (roi > 1.5 && volume > 5000) return { level: 'Medium', color: '🟡' };
  return { level: 'High', color: '🔴' };
}

async function getArbitrageOpportunities() {
  const prices = await fetchJupiterPrices();
  const raydium = await fetchRaydiumPairs();
  const orca = await fetchOrcaPools();
  const serum = await fetchSerumMarkets();

  const opportunities = [];

  const tokens = ['SOL', 'USDC', 'USDT', 'RAY', 'ORCA'];

  for (let token of tokens) {
    for (let other of tokens) {
      if (token === other) continue;

      const buyPrice = prices[token]?.price;
      const sellPrice = prices[other]?.price;

      if (!buyPrice || !sellPrice) continue;

      const roi = calculateROI(buyPrice, sellPrice);
      const volume = Math.floor(Math.random() * 20000) + 1000;
      const risk = scoreRisk(roi, volume);

      opportunities.push({
        pair: `${token}/${other}`,
        buyExchange: 'Jupiter',
        buyPrice: buyPrice.toFixed(2),
        sellExchange: 'Jupiter',
        sellPrice: sellPrice.toFixed(2),
        roi: roi.toFixed(2),
        volume,
        risk,
        timeLeft: `${Math.floor(Math.random() * 30) + 10}s`
      });
    }
  }

  return opportunities
    .filter(o => o.roi > 0.5)
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 10);
}

module.exports = { getArbitrageOpportunities };

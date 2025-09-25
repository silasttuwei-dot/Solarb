const { fetchJupiterPrices } = require('./multiDexPrices');

function formatOpportunity(pair, buyExchange, sellExchange, buyPrice, sellPrice, usdValue, roi) {
  const volume = Math.floor(usdValue);
  const timeLeft = `${Math.floor(Math.random() * 10) + 1} min`;
  const risk = getRiskLevel(roi);

  return {
    pair,
    buyExchange,
    sellExchange,
    buyPrice,
    sellPrice,
    roi: roi.toFixed(2),
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
  const prices = await fetchJupiterPrices();
  const opps = [];

  Object.entries(prices).forEach(([token, info]) => {
    if (!info.routes || info.routes.length < 2) return;

    for (let i = 0; i < info.routes.length; i++) {
      for (let j = i + 1; j < info.routes.length; j++) {
        const a = info.routes[i];
        const b = info.routes[j];

        const [cheap, expensive] = a.out < b.out ? [a, b] : [b, a];
        const priceDiff = (expensive.out - cheap.out) / cheap.out;
        const usdProfit = priceDiff * 1000;

        if (priceDiff < 0.003 || usdProfit < 1) continue;

        opps.push(
          formatOpportunity(
            `${token}/USDC`,
            cheap.dex,
            expensive.dex,
            cheap.out / 1e6,
            expensive.out / 1e6,
            usdProfit,
            priceDiff * 100
          )
        );
      }
    }
  });

  return opps.sort((x, y) => parseFloat(y.roi) - parseFloat(x.roi)).slice(0, 10);
}

module.exports = { getArbitrageOpportunities };

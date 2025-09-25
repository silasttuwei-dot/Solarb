const { fetchJupiterPrices } = require('./multiDexPrices');

// Format a single arbitrage opportunity
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

// Assign risk level based on ROI
function getRiskLevel(roi) {
  const r = parseFloat(roi);
  if (r > 5) return { level: 'High', color: '🔴' };
  if (r > 2) return { level: 'Medium', color: '🟠' };
  return { level: 'Low', color: '🟢' };
}

/* ------------------------------------------------------------------ */
/* 1. Extract all individual legs from Jupiter routePlan              */
/* 2. Compare every leg vs every other leg for same input→output      */
/* 3. Build arb signal only when priceDiff > 0.3% and > $1 USD        */
/* ------------------------------------------------------------------ */
async function getArbitrageOpportunities() {
  const prices = await fetchJupiterPrices();
  const opps = [];

  Object.entries(prices).forEach(([token, info]) => {
    if (!info.route || !info.price) return;

    // Collect all unique legs
    const legs = info.route.map(r => ({
      dex: r.dex,
      mintIn: r.swapInfo.inputMint,
      mintOut: r.swapInfo.outputMint,
      in: Number(r.swapInfo.inAmount),
      out: Number(r.swapInfo.outAmount),
      fee: Number(r.swapInfo.feeAmount || 0)
    }));

    // Compare every leg vs every other leg
    for (let i = 0; i < legs.length; i++) {
      for (let j = i + 1; j < legs.length; j++) {
        const a = legs[i];
        const b = legs[j];

        // Must be same directional swap
        if (a.mintIn !== b.mintIn || a.mintOut !== b.mintOut) continue;

        const [cheap, expensive] = a.out < b.out ? [a, b] : [b, a];
        const priceDiff = (expensive.out - cheap.out) / cheap.out;
        const usdProfit = priceDiff * 1000; // normalized to $1,000 trade

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

  // Sort by descending ROI
  return opps.sort((x, y) => parseFloat(y.roi) - parseFloat(x.roi)).slice(0, 10);
}

module.exports = { getArbitrageOpportunities };

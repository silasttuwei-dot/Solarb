

// arbitrage.js
const { fetchJupiterPrices } = require('./multiDexPrices');

function formatOpportunity(pair, buyExchange, sellExchange, buyPrice, sellPrice, usdValue, roi) {
  const volume = Math.floor(usdValue);
  const timeLeft = ${Math.floor(Math.random() * 10) + 1} min;
  const risk = getRiskLevel(roi);
  return { pair, buyExchange, sellExchange, buyPrice, sellPrice, roi: roi.toFixed(2), volume, timeLeft, risk };
}

function getRiskLevel(roi) {
  const r = parseFloat(roi);
  if (r > 5) return { level: 'High', color: '🔴' };
  if (r > 2) return { level: 'Medium', color: '🟠' };
  return { level: 'Low', color: '🟢' };
}

/ ------------------------------------------------------------------ /
/ 1.  extract all individual legs from the atomic Jupiter route       /
/ 2.  compare every leg vs every other leg for same input→output      /
/ 3.  build arb signal only when priceDiff > 0.3 % and > 1 USD        /
/ ------------------------------------------------------------------ /
async function getArbitrageOpportunities() {
  const prices = await fetchJupiterPrices();   // from your new helper
  const opps = [];

  Object.entries(prices).forEach(([token, info]) => {
    if (!info.route || !info.price) return;

    / --- collect all unique legs ----------------------------------- /
    const legs = info.route.map(r => ({
      dex: r.dex,
      mintIn:  r.swapInfo.inputMint,
      mintOut: r.swapInfo.outputMint,
      in:  Number(r.swapInfo.inAmount),
      out: Number(r.swapInfo.outAmount),
      fee: Number(r.swapInfo.feeAmount || 0)
    }));

    / --- compare every leg vs every other leg ----------------------- /
    for (let i = 0; i < legs.length; i++) {
      for (let j = i + 1; j < legs.length; j++) {
        const a = legs[i];
        const b = legs[j];

        // same directional swap ?
        if (a.mintIn !== b.mintIn || a.mintOut !== b.mintOut) continue;

        const [cheap, expensive] = a.out < b.out ? [a, b] : [b, a];
        const priceDiff = (expensive.out - cheap.out) / cheap.out; // fraction
        const usdProfit = priceDiff * 1000; // we normalised on 1 000 USD trade

        if (priceDiff < 0.003 || usdProfit < 1) continue;

        opps.push(
          formatOpportunity(
            ${token}/USDC,                // pair
            cheap.dex,                      // buyExchange
            expensive.dex,                  // sellExchange
            cheap.out  / 1e6,               // buyPrice  (USDC-out)
            expensive.out / 1e6,            // sellPrice (USDC-out)
            usdProfit,                      // nominal USD volume
            priceDiff * 100                 // ROI %
          )
        );
      }
    }
  });

  // descending ROI
  return opps.sort((x, y) => parseFloat(y.roi) - parseFloat(x.roi)).slice(0, 10);
}

module.exports = { getArbitrageOpportunities };


function estimatePnL(buy, sell) {
  const profit = (sell.price - buy.price).toFixed(6);
  const roi = ((profit / buy.price) * 100).toFixed(2);
  return { profit, roi };
}

module.exports = { estimatePnL };

// dexPrices.js  (drop-in replacement)
const { fetchJupiterPrices } = require('./multiRoutePrices');

module.exports = {
  fetchJupiterPrices,          // live cross-DEX edges
  fetchRaydiumPairs: fetchJupiterPrices, // stubs so old imports don’t break
  fetchOrcaPools:    fetchJupiterPrices,
  fetchSerumMarkets: fetchJupiterPrices
};

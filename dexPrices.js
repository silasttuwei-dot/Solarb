// dexPrices.js
const { fetchJupiterPrices } = require('./multiRoutePrices');

module.exports = {
  fetchJupiterPrices,          // live cross-DEX edges
  fetchRaydiumPairs: fetchJupiterPrices, // stubs for old names
  fetchOrcaPools:    fetchJupiterPrices,
  fetchSerumMarkets: fetchJupiterPrices
};

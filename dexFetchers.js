// dexFetchers.js
const fetch = require('node-fetch');

async function fetchJupiterPrices() {
  const url = 'https://price.jup.ag/v4/price?ids=SOL,USDC,USDT,RAY,ORCA,SRM,MNGO,STEP';
  const res = await fetch(url);
  const data = await res.json();
  return data.data; // normalized price map
}

async function fetchRaydiumPairs() {
  const url = 'https://api.raydium.io/v2/main/pairs';
  const res = await fetch(url);
  return await res.json();
}

async function fetchOrcaPools() {
  const url = 'https://api.orca.so/v1/whirlpool/list';
  const res = await fetch(url);
  return await res.json();
}

async function fetchSerumMarkets() {
  const url = 'https://openserum.io/api/serum/markets';
  const res = await fetch(url);
  return await res.json();
}

module.exports = {
  fetchJupiterPrices,
  fetchRaydiumPairs,
  fetchOrcaPools,
  fetchSerumMarkets
};

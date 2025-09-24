// dexFetchers.js
const fetch = require('node-fetch');

async function fetchJupiterPrices() {
  try {
    const url = 'https://price.jup.ag/v4/price?ids=SOL,USDC,USDT,RAY,ORCA,SRM,MNGO,STEP';
    const res = await fetch(url);
    const data = await res.json();
    console.log('✅ Jupiter prices fetched');
    return data.data || {};
  } catch (err) {
    console.error('❌ Jupiter fetch failed:', err.message);
    return {};
  }
}

async function fetchRaydiumPairs() {
  try {
    const url = 'https://api.raydium.io/v2/main/pairs';
    const res = await fetch(url);
    const data = await res.json();
    console.log('✅ Raydium pairs fetched');
    return data || [];
  } catch (err) {
    console.error('❌ Raydium fetch failed:', err.message);
    return [];
  }
}

async function fetchOrcaPools() {
  try {
    const url = 'https://api.orca.so/v1/whirlpool/list';
    const res = await fetch(url);
    const data = await res.json();
    console.log('✅ Orca pools fetched');
    return data || [];
  } catch (err) {
    console.error('❌ Orca fetch failed:', err.message);
    return [];
  }
}

async function fetchSerumMarkets() {
  try {
    const url = 'https://openserum.io/api/serum/markets';
    const res = await fetch(url);
    const data = await res.json();
    console.log('✅ Serum markets fetched');
    return data || [];
  } catch (err) {
    console.error('❌ Serum fetch failed:', err.message);
    return [];
  }
}

module.exports = {
  fetchJupiterPrices,
  fetchRaydiumPairs,
  fetchOrcaPools,
  fetchSerumMarkets
};

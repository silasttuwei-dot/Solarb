const fetch = require('node-fetch');

const tokens = [
  { name: 'SOL', mint: 'So11111111111111111111111111111111111111112' },
  { name: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  { name: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
  { name: 'RAY', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' },
  { name: 'ORCA', mint: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE' },
  { name: 'SRM', mint: 'SRMuP2HchTDzrXoUq8u7zBVRFEuEMasz1PA4N4y3g1S' },
  { name: 'MNGO', mint: 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac' },
  { name: 'STEP', mint: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT' }
];

const getTokenPrice = async (tokenMint) => {
  const url = `https://quote-api.jup.ag/v6/quote?inputMint=${tokenMint}&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000`;
  const response = await fetch(url);
  const data = await response.json();
  return data.swapUsdValue / 0.001;
};

const fetchAllPrices = async () => {
  const prices = [];
  for (const token of tokens) {
    try {
      const price = await getTokenPrice(token.mint);
      prices.push({ name: token.name, price });
    } catch (error) {
      console.error(`Error fetching price for ${token.name}:`, error.message);
    }
  }
  return prices;
};

module.exports = { fetchAllPrices };

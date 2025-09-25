const fetch = require('node-fetch');

// --- token catalogue ---------------------------------------------------------
const TOKENS = {
  SOL:  { mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
  USDC: { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
  USDT: { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
  RAY:  { mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', decimals: 6 },
  ORCA: { mint: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', decimals: 6 },
  SRM:  { mint: 'SRMuP2HchTDzrXoUq8u7zBVRFEuEMasz1PA4N4y3g1S', decimals: 6 },
  MNGO: { mint: 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac', decimals: 6 },
  STEP: { mint: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT', decimals: 6 }
};

const USDC_MINT = TOKENS.USDC.mint;
const QUOTE_URL = 'https://quote-api.jup.ag/v6/quote';

// --- core helper -------------------------------------------------------------
async function getQuote(mintIn, decimals) {
  const amount = String(10 ** decimals);
  const url = `${QUOTE_URL}?inputMint=${mintIn}&outputMint=${USDC_MINT}&amount=${amount}&slippageBps=50`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// --- public wrappers ---------------------------------------------------------
async function fetchJupiterPrices() {
  const entries = await Promise.all(
    Object.entries(TOKENS).map(async ([sym, { mint, decimals }]) => {
      try {
        const q = await getQuote(mint, decimals);
        const price = Number(q.outAmount) / 1e6;
        return [sym, {
          price: 1 / price,
          usdValue: q.swapUsdValue,
          route: q.routePlan.map(r => ({
            dex: r.swapInfo.label,
            bps: r.bps,
            out: r.swapInfo.outAmount
          }))
        }];
      } catch (e) {
        return [sym, { price: null, error: e.message }];
      }
    })
  );
  return Object.fromEntries(entries);
}

async function fetchRaydiumPairs()   { return fetchJupiterPrices(); }
async function fetchOrcaPools()      { return fetchJupiterPrices(); }
async function fetchSerumMarkets()   { return fetchJupiterPrices(); }

module.exports = {
  fetchJupiterPrices,
  fetchRaydiumPairs,
  fetchOrcaPools,
  fetchSerumMarkets
};

const fetch = require('node-fetch');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 60 }); // 1 min cache → 60 req/min safe

const TOKENS = {
  SOL:  { mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
  USDT: { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
  RAY:  { mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', decimals: 6 },
  ORCA: { mint: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', decimals: 6 },
  STEP: { mint: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT', decimals: 6 }
};
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

async function getQuote(mintIn, mintOut, amount) {
  const url = `https://quote-api.jup.ag/v6/quote?inputMint=${mintIn}&outputMint=${mintOut}&amount=${amount}&slippageBps=50&limit=2`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

exports.fetchJupiterPrices = async () => {
  if (cache.has('edges')) return cache.get('edges');
  const book = {}; // dex -> token -> {bid, ask}

  // ---- forward (token → USDC) ----
  for (const [sym, { mint, decimals }] of Object.entries(TOKENS)) {
    try {
      const amt = String(100 * (10 ** decimals));
      const fwd = await getQuote(mint, USDC_MINT, amt);
      const leg = fwd.routePlan[0];
      const dex = leg.swapInfo.label;
      if (!book[dex]) book[dex] = {};
      book[dex][sym] = { bid: Number(leg.swapInfo.outAmount) / 100, ask: null };
    } catch (e) {/* ignore */}
  }

  // ---- reverse (USDC → token) ----
  for (const [sym, { mint, decimals }] of Object.entries(TOKENS)) {
    try {
      const rev = await getQuote(USDC_MINT, mint, '10000000'); // 10 USDC
      const leg = rev.routePlan[0];
      const dex = leg.swapInfo.label;
      const tokens = Number(leg.swapInfo.outAmount);
      const ask = 10 / tokens;
      if (!book[dex]) book[dex] = {};
      if (!book[dex][sym]) book[dex][sym] = { bid: null };
      book[dex][sym].ask = ask;
    } catch (e) {/* ignore */}
  }

  // ---- cross-dex ----
  const opps = [];
  const dexes = Object.keys(book);
  for (const tok of Object.keys(TOKENS)) {
    for (const buyDex of dexes) {
      for (const sellDex of dexes) {
        if (buyDex === sellDex) continue;
        const buy = book[buyDex][tok];
        const sell = book[sellDex][tok];
        if (!buy?.ask || !sell?.bid) continue;
        const gross = (sell.bid - buy.ask) / buy.ask;
        const net   = gross - 0.001; // 0.1 % fee
        if (net < 0.001) continue; // 0.1 % net
        opps.push({
          pair: `${tok}/USDC`,
          buyExchange: buyDex,
          sellExchange: sellDex,
          buyPrice: buy.ask,
          sellPrice: sell.bid,
          roi: (net * 100).toFixed(2),
          volume: Math.floor(net * 100),
          timeLeft: '1 min',
          risk: net > 0.02 ? { level: 'High', color: '🔴' }
                : net > 0.01 ? { level: 'Medium', color: '🟠' }
                : { level: 'Low',  color: '🟢' }
        });
      }
    }
  }
  cache.set('edges', opps);
  return opps.slice(0, 10);
};

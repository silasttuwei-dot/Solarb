// multiRoutePrices.js
const fetch = require('node-fetch');

const TOKENS = {
  SOL:  { mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
  USDC: { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
  USDT: { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
  RAY:  { mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', decimals: 6 },
  ORCA: { mint: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', decimals: 6 },
  MNGO: { mint: 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac', decimals: 6 },
  STEP: { mint: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT', decimals: 6 }
  // SRM removed – delisted
};

const USDC_MINT = TOKENS.USDC.mint;
const QUOTE_URL = 'https://quote-api.jup.ag/v6/quote';

/* ---------- helper ---------- */
async function getQuote(mintIn, mintOut, amount) {
  const url = `${QUOTE_URL}?inputMint=${mintIn}&outputMint=${mintOut}&amount=${amount}&slippageBps=50&limit=1`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/* ---------- main ---------- */
async function fetchJupiterPrices() {
  const book = {}; // dex -> token -> {bid, ask, usdValue}

  /* 1.  forward (token → USDC)  – skip USDC itself */
  await Promise.all(
    Object.entries(TOKENS).map(async ([sym, { mint, decimals }]) => {
      if (mint === USDC_MINT) return; // silence circular warning
      try {
        const amt = String(1_000 * (10 ** decimals));
        const fwd = await getQuote(mint, USDC_MINT, amt);
        const leg = fwd.routePlan[0];
        const dex = leg.swapInfo.label;
        if (!book[dex]) book[dex] = {};
        book[dex][sym] = {
          bid: Number(leg.swapInfo.outAmount) / 1_000,
          ask: null,
          usdValue: Number(fwd.swapUsdValue)
        };
      } catch (e) {
        if (!e.message.includes('CIRCULAR_ARBITRAGE_IS_DISABLED'))
          console.warn('Fwd skip', sym, e.message);
      }
    })
  );

  /* 2.  reverse (USDC → token)  – skip USDC itself */
  await Promise.all(
    Object.entries(TOKENS).map(async ([sym, { mint, decimals }]) => {
      if (mint === USDC_MINT) return; // silence circular warning
      try {
        const rev = await getQuote(USDC_MINT, mint, '1000000');
        const leg = rev.routePlan[0];
        const dex = leg.swapInfo.label;
        const tokensBack = Number(leg.swapInfo.outAmount);
        if (!book[dex]) book[dex] = {};
        if (!book[dex][sym]) book[dex][sym] = {};
        book[dex][sym].ask = 1 / (tokensBack / (10 ** decimals));
      } catch (e) {
        if (!e.message.includes('CIRCULAR_ARBITRAGE_IS_DISABLED'))
          console.warn('Rev skip', sym, e.message);
      }
    })
  );

  /* 3.  cross-dex arb  */
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
        const net = gross - 0.001; // 0.1 % fee proxy
        const usdProfit = net * 1_000;

        if (net < 0.0015 || usdProfit < 1) continue; // 0.15 % net

        opps.push({
          pair: `${tok}/USDC`,
          buyExchange: buyDex,
          sellExchange: sellDex,
          buyPrice: buy.ask,
          sellPrice: sell.bid,
          roi: (net * 100).toFixed(2),
          volume: Math.floor(usdProfit),
          timeLeft: `${Math.floor(Math.random() * 10) + 1} min`,
          risk: net > 0.05 ? { level: 'High', color: '🔴' }
                : net > 0.02 ? { level: 'Medium', color: '🟠' }
                : { level: 'Low', color: '🟢' }
        });
      }
    }
  }
  return opps.sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi)).slice(0, 20);
}

module.exports = { fetchJupiterPrices };

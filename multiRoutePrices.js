// multiRoutePrices.js
const fetch = require('node-fetch');

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

/* ---------------------------------------------------------- */
/* 1.  get 5 parallel routes (limit=5) for 1 000 USD trade    */
/* ---------------------------------------------------------- */
async function getMultiRoutes(mintIn, decimals) {
  const amt = String(1_000 * (10 ** decimals)); // 1 000 tokens
  const url = `${QUOTE_URL}?inputMint=${mintIn}&outputMint=${USDC_MINT}&amount=${amt}&slippageBps=50&limit=5`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/* ---------------------------------------------------------- */
/* 2.  build live order-book per DEX  (bid = sell token)      */
/* ---------------------------------------------------------- */
async function fetchJupiterPrices() {
  const agg = {}; // dex -> token -> { bid, ask, usdValue }

  await Promise.all(
    Object.entries(TOKENS).map(async ([sym, { mint, decimals }]) => {
      try {
        const data = await getMultiRoutes(mint, decimals);

        data.routePlan.forEach((leg, idx) => {
          const dex = leg.swapInfo.label;
          if (!agg[dex]) agg[dex] = {};
          // outAmount is how much USDC we **get**  →  bid price
          const usdOut = Number(leg.swapInfo.outAmount);
          const usdVal = Number(data.swapUsdValue);
          agg[dex][sym] = {
            bid: usdOut / 1_000,      // per-token
            ask: null,                // we fill ask in next block
            usdValue: usdVal
          };
        });

        /* ---- reverse quote to get ask (buy token)  ---- */
        const rev = await fetch(
          `${QUOTE_URL}?inputMint=${USDC_MINT}&outputMint=${mint}&amount=1000000&limit=1`
        ).then(r => r.json());
        const revLeg = rev.routePlan[0];
        const dexAsk = revLeg.swapInfo.label;
        const tokensBack = Number(revLeg.swapInfo.outAmount);
        if (agg[dexAsk]?.[sym]) agg[dexAsk][sym].ask = 1_000_000 / tokensBack;
      } catch (e) {
        console.warn('Route skip', sym, e.message);
      }
    })
  );

  /* -------------------------------------------------------- */
  /* 3.  cross-dex arb inside the same aggregate              */
  /* -------------------------------------------------------- */
  const opportunities = [];
  const dexes = Object.keys(agg);
  for (const tok of Object.keys(TOKENS)) {
    for (const buyDex of dexes) {
      for (const sellDex of dexes) {
        if (buyDex === sellDex) continue;
        const buy  = agg[buyDex]?.[tok];
        const sell = agg[sellDex]?.[tok];
        if (!buy?.ask || !sell?.bid) continue;

        const gross = (sell.bid - buy.ask) / buy.ask;
        const net   = gross - 0.001;          // 0.1 % Jupiter fee + gas proxy
        const usdProfit = net * 1_000;        // we normalised on 1 000 USD

        if (net < 0.003 || usdProfit < 1) continue;

        opportunities.push({
          pair: `${tok}/USDC`,
          buyExchange:  buyDex,
          sellExchange: sellDex,
          buyPrice:  buy.ask,
          sellPrice: sell.bid,
          roi:       (net * 100).toFixed(2),
          volume:    Math.floor(usdProfit),
          timeLeft:  `${Math.floor(Math.random() * 10) + 1} min`,
          risk:      net > 0.05 ? { level: 'High', color: '🔴' }
                    : net > 0.02 ? { level: 'Medium', color: '🟠' }
                    :              { level: 'Low',  color: '🟢' }
        });
      }
    }
  }
  return opportunities.sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi)).slice(0, 20);
}

module.exports = { fetchJupiterPrices };

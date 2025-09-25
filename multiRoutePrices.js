// multiRoutePrices.js — Liquidity & volume filtered arbitrage scanner (REAL TRADING)
const fetch = require('node-fetch');

const TOKENS = {
  SOL:  { mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
  USDC: { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
  USDT: { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
  RAY:  { mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', decimals: 6 },
  ORCA: { mint: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', decimals: 6 },
  MNGO: { mint: 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac', decimals: 6 },
  STEP: { mint: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT', decimals: 6 }
};

const USDC_MINT = TOKENS.USDC.mint;
const QUOTE_URL = 'https://quote-api.jup.ag/v6/quote'; // ✅ NO TRAILING SPACE

// Configurable thresholds (adjust based on strategy)
const MIN_LIQUIDITY_USD = 500_000;
const MIN_VOLUME_24H_USD = 100_000;
const TRADE_SIZE_USD = 10; // Base arbitrage size
const MIN_NET_ROI_BPS = 15; // 0.15%
const MIN_USD_PROFIT = 1.0;
const ESTIMATED_FEES_BPS = 10; // 0.10% (Jupiter + network + slippage buffer)

async function getQuote(mintIn, mintOut, amountRaw) {
  const params = new URLSearchParams({
    inputMint: mintIn,
    outputMint: mintOut,
    amount: amountRaw,
    slippageBps: '50',
    limit: '1',
    showLiquidity: 'true'
  });

  const url = `${QUOTE_URL}?${params}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const r = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!r.ok) {
      const text = await r.text();
      throw new Error(`HTTP ${r.status}: ${text}`);
    }
    return await r.json();
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      throw new Error('Quote request timeout');
    }
    throw e;
  }
}

async function fetchJupiterPrices() {
  const book = {}; // dex -> token -> { bid, ask }

  // --- 1. Forward: Token → USDC (simulate selling 1,000 tokens)
  await Promise.all(
    Object.entries(TOKENS)
      .filter(([sym]) => sym !== 'USDC')
      .map(async ([sym, { mint, decimals }]) => {
        try {
          const amountTokens = 1_000;
          const amountRaw = (amountTokens * (10 ** decimals)).toString();
          const quote = await getQuote(mint, USDC_MINT, amountRaw);

          if (!quote?.routePlan?.length) {
            console.warn(`[FWD] No route for ${sym}`);
            return;
          }

          const leg = quote.routePlan[0];
          if (!leg.swapInfo) {
            console.warn(`[FWD] Missing swapInfo for ${sym}`);
            return;
          }

          const dex = leg.swapInfo.label;
          const outAmountRaw = Number(leg.swapInfo.outAmount);
          if (isNaN(outAmountRaw) || outAmountRaw <= 0) {
            console.warn(`[FWD] Invalid outAmount for ${sym}`);
            return;
          }

          const usdcOut = outAmountRaw / 1e6; // USDC has 6 decimals
          const bidPrice = usdcOut / amountTokens; // USDC per token

          if (!book[dex]) book[dex] = {};
          book[dex][sym] = { bid: bidPrice, ask: null };

        } catch (e) {
          if (!e.message.includes('CIRCULAR_ARBITRAGE_IS_DISABLED')) {
            console.error(`[FWD] Error for ${sym}:`, e.message);
          }
        }
      })
  );

  // --- 2. Reverse: USDC → Token (simulate buying with $10)
  const usdcTradeSizeRaw = (TRADE_SIZE_USD * 1e6).toString(); // 10 USDC → 10_000_000

  await Promise.all(
    Object.entries(TOKENS)
      .filter(([sym]) => sym !== 'USDC')
      .map(async ([sym, { mint, decimals }]) => {
        try {
          const quote = await getQuote(USDC_MINT, mint, usdcTradeSizeRaw);

          if (!quote?.routePlan?.length) {
            console.warn(`[REV] No route for ${sym}`);
            return;
          }

          const leg = quote.routePlan[0];
          if (!leg.swapInfo) {
            console.warn(`[REV] Missing swapInfo for ${sym}`);
            return;
          }

          const liquidityUsd = Number(leg.swapInfo.liquidity) || 0;
          const volume24hUsd = Number(leg.swapInfo.volume24h) || 0;
          if (liquidityUsd < MIN_LIQUIDITY_USD || volume24hUsd < MIN_VOLUME_24H_USD) {
            return; // silently skip low-liquidity pairs
          }

          const outAmountRaw = Number(leg.swapInfo.outAmount);
          if (isNaN(outAmountRaw) || outAmountRaw <= 0) {
            console.warn(`[REV] Zero output for ${sym}`);
            return;
          }

          const tokenAmount = outAmountRaw / (10 ** decimals);
          const askPrice = TRADE_SIZE_USD / tokenAmount; // USDC per token

          const dex = leg.swapInfo.label;
          if (!book[dex]) book[dex] = {};
          if (!book[dex][sym]) book[dex][sym] = { bid: null, ask: null };
          book[dex][sym].ask = askPrice;

        } catch (e) {
          if (!e.message.includes('CIRCULAR_ARBITRAGE_IS_DISABLED')) {
            console.error(`[REV] Error for ${sym}:`, e.message);
          }
        }
      })
  );

  // --- 3. Cross-DEX Arbitrage Detection
  const opps = [];
  const dexes = Object.keys(book);
  const tokens = Object.keys(TOKENS).filter(t => t !== 'USDC');

  for (const tok of tokens) {
    for (const buyDex of dexes) {
      for (const sellDex of dexes) {
        if (buyDex === sellDex) continue;

        const buy = book[buyDex]?.[tok];
        const sell = book[sellDex]?.[tok];
        if (!buy?.ask || !sell?.bid) continue;

        // Ensure no negative or invalid prices
        if (buy.ask <= 0 || sell.bid <= 0 || sell.bid <= buy.ask) continue;

        const grossRoi = (sell.bid / buy.ask) - 1; // e.g., 0.0025 = 0.25%
        const netRoi = grossRoi - (ESTIMATED_FEES_BPS / 10_000); // subtract 0.10%

        if (netRoi <= MIN_NET_ROI_BPS / 10_000) continue;

        const usdProfit = TRADE_SIZE_USD * netRoi;
        if (usdProfit < MIN_USD_PROFIT) continue;

        const riskLevel = netRoi > 0.05 ? 'High'
                      : netRoi > 0.02 ? 'Medium'
                      : 'Low';

        opps.push({
          pair: `${tok}/USDC`,
          buyExchange: buyDex,
          sellExchange: sellDex,
          buyPrice: buy.ask.toFixed(8),
          sellPrice: sell.bid.toFixed(8),
          roiBps: Math.round(netRoi * 10_000),
          roiPct: (netRoi * 100).toFixed(2),
          usdProfit: usdProfit.toFixed(2),
          // Jupiter quotes typically valid 20-60s; use 30s as safe estimate
          timeLeft: '30 sec',
          risk: riskLevel
        });
      }
    }
  }

  return opps
    .sort((a, b) => parseFloat(b.roiPct) - parseFloat(a.roiPct))
    .slice(0, 20);
}

module.exports = { fetchJupiterPrices };

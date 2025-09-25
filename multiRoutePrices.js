// multiRoutePrices.js — Cross-token, cross-DEX arbitrage scanner (matches Create.xyz "All opportunities")
const fetch = require('node-fetch');

// --- Token Definitions ---
const TOKENS = {
  SOL:  { mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
  USDC: { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
  USDT: { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
  RAY:  { mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', decimals: 6 },
  JUP:  { mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', decimals: 6 },
  BONK: { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB2r', decimals: 5 },
  WIF:  { mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', decimals: 6 },
  PYTH: { mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', decimals: 8 },
};

// --- Supported DEXes (used to isolate direct routes) ---
const DEXES = [
  'Raydium',
  'Orca',
  'Phoenix',
  'Serum',
  'Jupiter Aggregator',
  'Meteora',
  'GooseFX',
  'Lifinity',
  'Clone',
  'Symmetry'
];

// --- Configuration ---
const QUOTE_URL = 'https://quote-api.jup.ag/v6/quote';
const TRADE_SIZE_USD = 10; // Used for price discovery (not execution size)
const MIN_NET_ROI_BPS = 15; // Minimum net ROI: 0.15%
const ESTIMATED_FEES_BPS = 10; // Estimated total fees: 0.10%

// --- Token Pairs to Monitor (matches your dashboard) ---
const TOKEN_PAIRS = [
  { base: 'USDT', quote: 'RAY' },
  { base: 'USDC', quote: 'RAY' },
  { base: 'SOL', quote: 'USDT' },
  { base: 'SOL', quote: 'RAY' },
  { base: 'SOL', quote: 'JUP' },
  { base: 'SOL', quote: 'USDC' },
  { base: 'USDT', quote: 'JUP' },
  { base: 'USDC', quote: 'USDT' },
  { base: 'RAY', quote: 'BONK' },
  { base: 'USDT', quote: 'BONK' },
  { base: 'RAY', quote: 'JUP' },
  { base: 'SOL', quote: 'WIF' },
  { base: 'BONK', quote: 'PYTH' },
  { base: 'SOL', quote: 'PYTH' },
];

// --- Fetch Direct Quote from a Specific DEX ---
async function getDirectQuote(inputMint, outputMint, amountRaw, targetDex) {
  const otherDexes = DEXES.filter(d => d !== targetDex).join(',');
  const url = `${QUOTE_URL}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountRaw}&onlyDirectRoutes=true&excludeDexes=${encodeURIComponent(otherDexes)}&showLiquidity=true`;
  
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
      throw new Error('Timeout');
    }
    throw e;
  }
}

// --- Extract Price from Quote ---
function extractPrice(quote, inputToken, outputToken) {
  if (!quote?.routePlan?.length) return null;
  const leg = quote.routePlan[0];
  if (!leg.swapInfo) return null;

  const outAmountRaw = Number(leg.swapInfo.outAmount);
  if (isNaN(outAmountRaw) || outAmountRaw <= 0) return null;

  const outputDecimals = TOKENS[outputToken].decimals;
  const outputAmount = outAmountRaw / (10 ** outputDecimals);
  const price = TRADE_SIZE_USD / outputAmount; // e.g., USDT per RAY

  return price;
}

// --- Main Arbitrage Scanner ---
async function fetchJupiterPrices() {
  const book = {};

  // Initialize book structure: book[dex][base][quote] = price
  for (const dex of DEXES) {
    book[dex] = {};
    for (const { base, quote } of TOKEN_PAIRS) {
      if (!book[dex][base]) book[dex][base] = {};
      book[dex][base][quote] = null;
    }
  }

  // Fetch direct quotes for each pair on each DEX
  for (const { base, quote } of TOKEN_PAIRS) {
    for (const dex of DEXES) {
      try {
        const inputMint = TOKENS[base].mint;
        const outputMint = TOKENS[quote].mint;
        const amountRaw = (TRADE_SIZE_USD * (10 ** TOKENS[base].decimals)).toString();

        const quoteData = await getDirectQuote(inputMint, outputMint, amountRaw, dex);
        const price = extractPrice(quoteData, base, quote);

        if (price !== null) {
          book[dex][base][quote] = price;
        }
      } catch (e) {
        // Silently skip failed DEX/pair combos (common for unsupported pairs)
        continue;
      }
    }
  }

  // Detect arbitrage opportunities
  const opportunities = [];

  for (const { base, quote } of TOKEN_PAIRS) {
    for (const buyDex of DEXES) {
      for (const sellDex of DEXES) {
        if (buyDex === sellDex) continue;

        const buyPrice = book[buyDex]?.[base]?.[quote];
        const sellPrice = book[sellDex]?.[base]?.[quote];

        if (!buyPrice || !sellPrice || sellPrice <= buyPrice) continue;

        const grossRoi = (sellPrice - buyPrice) / buyPrice;
        const netRoi = grossRoi - (ESTIMATED_FEES_BPS / 10_000);

        if (netRoi < MIN_NET_ROI_BPS / 10_000) continue;

        const usdProfit = TRADE_SIZE_USD * netRoi;
        if (usdProfit < 0.1) continue; // Ignore negligible profits

        const risk = netRoi > 0.05 ? 'High' : netRoi > 0.02 ? 'Medium' : 'Low';

        opportunities.push({
          pair: `${base}/${quote}`,
          buyExchange: buyDex,
          sellExchange: sellDex,
          buyPrice: buyPrice.toFixed(8),
          sellPrice: sellPrice.toFixed(8),
          roiPct: (netRoi * 100).toFixed(2),
          usdProfit: usdProfit.toFixed(2),
          timeLeft: '30 sec',
          risk
        });
      }
    }
  }

  // Sort by ROI (descending) and limit to top 20
  return opportunities
    .sort((a, b) => parseFloat(b.roiPct) - parseFloat(a.roiPct))
    .slice(0, 20);
}

module.exports = { fetchJupiterPrices };

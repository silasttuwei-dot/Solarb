import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

/* ---------- config ---------- */
const MIN_PROFIT = Number(process.env.MIN_PROFIT || 0.5); // %
const CACHE_TTL  = 5_000;                                // 5 s
let cache        = [];
let lastFetch    = 0;

/* ---------- helpers ---------- */
const fmtNum = (n) => {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
};

/* ---------- mock scanner (replace with real calls later) ---------- */
function scan() {
  const now = Date.now();
  if (now - lastFetch < CACHE_TTL) return cache;
  lastFetch = now;

  const tokens = [
    { symbol: 'SOL',  name: 'Solana',  logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' },
    { symbol: 'USDC', name: 'USD Coin',logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png' },
    { symbol: 'BONK', name: 'Bonk',    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png' },
    { symbol: 'RAY',  name: 'Raydium', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png' },
  ];
  const dexes = ['Jupiter', 'Raydium', 'Orca', 'Serum', 'Saber', 'Aldrin', 'Mercurial', 'Lifinity'];

  cache = Array.from({ length: 12 }, (_, i) => {
    const [a, b] = [tokens[i % tokens.length], tokens[(i + 1) % tokens.length]];
    const profit = Math.random() * 8 + MIN_PROFIT; // always above user threshold
    return {
      id:                `mock-${i}`,
      tokenA:            a,
      tokenB:            b,
      buyDex:            dexes[i % dexes.length],
      sellDex:           dexes[(i + 3) % dexes.length],
      profitPercentage:  profit,
      estimatedProfit:   Math.random() * 200 + 20,
      volume:            Math.random() * 50_000 + 5_000,
      timeLeft:          `${Math.floor(Math.random() * 5 + 1)}m`,
    };
  }).filter((row) => row.profitPercentage >= MIN_PROFIT);
  return cache;
}

/* ---------- routes ---------- */
app.get('/arbitrage-opportunities', (req, res) => {
  const rows = scan();
  res.json(rows);
});

app.get('/health', (_, res) => res.send('OK'));

/* ---------- start ---------- */
app.listen(PORT, () => console.log(`Scanner live on :${PORT}`));

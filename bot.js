const { Telegraf } = require('telegraf');
const express = require('express');
const fetch = require('node-fetch');
const { getTokenMeta } = require('./tokenMeta');
const { getBestRoutes } = require('./jupiter');
const { estimatePnL } = require('./pnl');
const { simulateArbitrage } = require('./simulator');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
app.use(bot.webhookCallback('/telegram'));

// 🎛️ Inline Button Dashboard
bot.start((ctx) => {
  ctx.reply(
    '👋 Welcome to your Solana Arbitrage Bot!\nChoose an action below:',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔍 Scan Token', callback_data: 'scan' }],
          [{ text: '📡 Watch Token', callback_data: 'watch' }],
          [{ text: '📈 Top ROI Tokens', callback_data: 'top' }],
          [{ text: '🧪 Scan Meme List', callback_data: 'scanlist' }],
          [{ text: '🧠 Validate Token', callback_data: 'validate' }]
        ]
      }
    }
  );
});

// 🔁 Swap simulator
function simulateSwap(x, y, dx, fee = 0.003) {
  const dxAfterFee = dx * (1 - fee);
  const dy = (dxAfterFee * y) / (x + dxAfterFee);
  return dy;
}

// 🔍 Orca pool finder
async function findOrcaPoolForMint(tokenMint) {
  const res = await fetch('https://api.orca.so/pools');
  const pools = await res.json();

  for (const pool of pools) {
    const { tokenA, tokenB, address } = pool;
    const isSolPair =
      tokenA.mint === 'So11111111111111111111111111111111111111112' ||
      tokenB.mint === 'So11111111111111111111111111111111111111112';

    const isTargetMint =
      tokenA.mint === tokenMint || tokenB.mint === tokenMint;

    if (isSolPair && isTargetMint) {
      return {
        poolAddress: address,
        tokenA,
        tokenB
      };
    }
  }

  return null;
}

// 🧠 /validate command
bot.command('validate', async (ctx) => {
  const mint = ctx.message.text.split(' ')[1];
  if (!mint) return ctx.reply('❗ Please provide a token mint address.');

  try {
    const poolInfo = await findOrcaPoolForMint(mint);
    if (!poolInfo) return ctx.reply('❌ No Orca pool found for this token.');

    const rpcUrl = 'https://api.mainnet-beta.solana.com';
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [poolInfo.poolAddress, { encoding: 'base64' }]
      })
    });

    const data = await res.json();
    const buffer = Buffer.from(data.result.value.data[0], 'base64');

    const reserveA = buffer.readBigUInt64LE(64);
    const reserveB = buffer.readBigUInt64LE(72);

    const isSolA = poolInfo.tokenA.mint === 'So11111111111111111111111111111111111111112';
    const solReserve = isSolA ? reserveA : reserveB;
    const tokenReserve = isSolA ? reserveB : reserveA;

    const sol = Number(solReserve) / 1e9;
    const token = Number(tokenReserve) / Math.pow(10, poolInfo.tokenA.decimals || 6);
    const inputAmount = 1;

    const buyAmount = simulateSwap(sol, token, inputAmount);
    const sellAmount = simulateSwap(token, sol, buyAmount);
    const roi = (((sellAmount - inputAmount) / inputAmount) * 100).toFixed(2);

    ctx.reply(`
✅ Token: ${poolInfo.tokenA.symbol === 'SOL' ? poolInfo.tokenB.symbol : poolInfo.tokenA.symbol}
💱 Buy: 1 SOL → ${buyAmount.toFixed(4)} tokens
💸 Sell: ${buyAmount.toFixed(4)} tokens → ${sellAmount.toFixed(4)} SOL
📊 ROI: ${roi}%
✅ Liquidity: ${token.toFixed(0)} tokens in pool
    `);
  } catch (err) {
    console.error('Error in /validate:', err);
    ctx.reply('❌ Validation failed. Pool may be missing or RPC unreachable.');
  }
});

// 🔁 /scan command
bot.command('scan', async (ctx) => {
  const input = ctx.message.text.split(' ')[1];
  if (!input) return ctx.reply('❗ Please provide a token mint address.');

  try {
    const meta = await getTokenMeta(input);
    const routes = await getBestRoutes(input);
    const pnl = estimatePnL(routes.buy, routes.sell);
    const sim = await simulateArbitrage(routes.buy.price, routes.sell.price, 0.0001);

    ctx.reply(`
🔍 Token: $${meta.symbol}
💱 Buy: ${routes.buy.dex} @ ${routes.buy.price} SOL
💸 Sell: ${routes.sell.dex} @ ${routes.sell.price} SOL
📈 Route: ${routes.buy.dex} → ${routes.sell.dex}
📊 PnL: +${pnl.profit} SOL (ROI: ${pnl.roi}%)
⚙️ Execution: Simulated only
🧪 ${sim}
${meta.symbol === 'UNKNOWN' ? '⚠️ Token metadata not found — using default values.' : ''}
    `);
  } catch (err) {
    ctx.reply(`❌ Scan failed: ${err.message}`);
  }
});

// 📡 /watch command
bot.command('watch', async (ctx) => {
  const input = ctx.message.text.split(' ')[1];
  if (!input) return ctx.reply('❗ Please provide a token mint address to watch.');

  try {
    const routes = await getBestRoutes(input);
    const pnl = estimatePnL(routes.buy, routes.sell);

    if (parseFloat(pnl.roi) > 5) {
      ctx.reply(`👀 Watching token: ${input}\nCurrent ROI: ${pnl.roi}%\n✅ Liquidity detected.`);
    } else {
      ctx.reply(`👀 Watching token: ${input}\nROI too low (${pnl.roi}%) — will alert if it spikes.`);
    }
  } catch (err) {
    ctx.reply(`❌ Watch failed: ${err.message}`);
  }
});

// 📈 /top command
bot.command('top', async (ctx) => {
  const tokenList = await fetch('https://token.jup.ag/all').then(res => res.json());
  const amount = 1_000_000_000;
  let results = [];

  for (const token of tokenList.slice(0, 100)) {
    const mint = token.address;
    const symbol = token.symbol || 'UNKNOWN';

    try {
      const buyRes = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${mint}&amount=${amount}`);
      const sellRes = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${mint}&outputMint=So11111111111111111111111111111111111111112&amount=${amount}`);
      const buyData = await buyRes.json();
      const sellData = await sellRes.json();

      if (!buyData.routes?.length || !sellData.routes?.length) continue;

      const buyPrice = buyData.outAmount / amount;
      const sellPrice = sellData.outAmount / amount;
      const roi = (((sellPrice - buyPrice) / buyPrice) * 100).toFixed(2);
      const liquidity = Math.min(
        buyData.routes[0].marketInfos[0]?.liquidity || 0,
        sellData.routes[0].marketInfos[0]?.liquidity || 0
      );
      const slippage = Math.max(
        parseFloat(buyData.priceImpactPct || '0'),
        parseFloat(sellData.priceImpactPct || '0')
      );

      if (parseFloat(roi) > 1 && liquidity > 1000 && slippage < 1) {
        results.push({
          symbol,
          buy: buyData.routes[0].marketInfos[0].label,
          sell: sellData.routes[0].marketInfos[0].label,
          buyPrice: buyPrice.toFixed(6),
          sellPrice: sellPrice.to

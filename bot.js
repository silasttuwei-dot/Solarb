const { Telegraf } = require('telegraf');
const express = require('express');
const fetch = require('node-fetch');

// ✅ Replace with your actual bot token
const BOT_TOKEN = process.env.BOT_TOKEN || 'your-telegram-bot-token';
const bot = new Telegraf(BOT_TOKEN);

// 🧠 Swap simulator
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

// 🧪 /validate command
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

// 🌐 Webhook server for Render
const app = express();
app.use(bot.webhookCallback('/telegram'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  const url = process.env.RENDER_EXTERNAL_URL || `https://your-render-url.com`;
  await bot.telegram.setWebhook(`${url}/telegram`);
  console.log(`🚀 Bot listening on ${url}/telegram`);
});

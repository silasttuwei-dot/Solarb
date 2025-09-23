const { Telegraf } = require('telegraf');
const express = require('express');
const { getTokenMeta } = require('./tokenMeta');
const { getBestRoutes } = require('./jupiter');
const { estimatePnL } = require('./pnl');
const { simulateArbitrage } = require('./simulator');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
app.use(bot.webhookCallback('/telegram'));

// 🔧 TEMPORARILY DISABLED CHAT ID RESTRICTION FOR DEBUGGING
// bot.use((ctx, next) => {
//   if (ctx.chat.id.toString() !== process.env.CHAT_ID) return;
//   return next();
// });

// 🎛️ Inline Button Dashboard
bot.start((ctx) => {
  console.log('Received /start');
  ctx.reply(
    '👋 Welcome to your Solana Arbitrage Bot!\nChoose an action below:',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔍 Scan Token', callback_data: 'scan' }],
          [{ text: '📡 Watch Token', callback_data: 'watch' }],
          [{ text: '📈 Top ROI Tokens', callback_data: 'top' }],
          [{ text: '🧪 Scan Meme List', callback_data: 'scanlist' }]
        ]
      }
    }
  );
});

// 🔁 /scan command
bot.command('scan', async (ctx) => {
  console.log('Received /scan command:', ctx.message.text);

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

    if (parseFloat(pnl.roi) > 10 && process.env.CHAT_ID) {
      bot.telegram.sendMessage(process.env.CHAT_ID, `🔥 High ROI Alert!\nToken: $${meta.symbol}\nROI: ${pnl.roi}%`);
    }
  } catch (err) {
    console.error('Error during scan:', err);
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

// 📈 /top command — real-time tradeable arbitrage
bot.command('top', async (ctx) => {
  const tokenList = [
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'Es9vMFrzaCERz2wVRdA7z5iYkZLZtq5XyXk1F6Z7Z7Z7', // USDT
    'So11111111111111111111111111111111111111112', // SOL
    '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E', // BTC
    '7vfCXTqQjWbvwZz3YtYkJzvJ6U9zJzvJzvJzvJzvJzvJ'  // Example meme
  ];

  let results = [];

  for (const mint of tokenList) {
    try {
      const meta = await getTokenMeta(mint);
      const routes = await getBestRoutes(mint);
      const pnl = estimatePnL(routes.buy, routes.sell);
      const liquidity = Math.min(routes.buy.volume || 0, routes.sell.volume || 0);

      if (liquidity > 1000 && parseFloat(pnl.roi) > 1) {
        results.push({
          symbol: meta.symbol,
          buy: routes.buy,
          sell: routes.sell,
          roi: pnl.roi,
          liquidity
        });
      }
    } catch {
      continue;
    }
  }

  results.sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi));
  const top = results.slice(0, 3).map((t, i) => `
${i + 1}. $${t.symbol}
💱 Buy: ${t.buy.dex} @ ${t.buy.price} SOL
💸 Sell: ${t.sell.dex} @ ${t.sell.price} SOL
📊 ROI: ${t.roi}%
✅ Tradeable with $${t.liquidity} liquidity
  `).join('\n');

  ctx.reply(`📈 Top Tradeable Arbitrage Opportunities\n${top || '❌ No profitable routes found.'}`);
});

// 🧪 /scanlist command
bot.command('scanlist', async (ctx) => {
  const memeMints = [
    'G9mnvwgHtXYuBH1U7oYj2qF94x57xPvCkUJfpumpump',
    '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    'Es9vMFrzaCERz2wVRdA7z5iYkZLZtq5XyXk1F6Z7Z7Z7'
  ];

  let results = [];

  for (const mint of memeMints) {
    try {
      const routes = await getBestRoutes(mint);
      const pnl = estimatePnL(routes.buy, routes.sell);
      results.push(`✅ ${mint} — ROI: ${pnl.roi}%`);
    } catch {
      results.push(`❌ ${mint} — No liquidity`);
    }
  }

  ctx.reply(`🧪 Scan Results:\n${results.join('\n')}`);
});

// 🎛️ Handle Button Actions
bot.on('callback_query', async (ctx) => {
  const action = ctx.callbackQuery.data;
  console.log('Button pressed:', action);

  switch (action) {
    case 'scan':
      ctx.reply('🔍 Send /scan <token_mint> to simulate arbitrage.');
      break;
    case 'watch':
      ctx.reply('📡 Send /watch <token_mint> to track liquidity and ROI.');
      break;
    case 'top':
      ctx.reply('📈 Send /top to view high-ROI tokens.');
      break;
    case 'scanlist':
      ctx.reply('🧪 Send /scanlist to scan meme tokens for liquidity.');
      break;
    default:
      ctx.reply('❓ Unknown action.');
  }
});

// 🧪 Fallback listener
bot.on('message', (ctx) => {
  if (!ctx.message.text.startsWith('/')) {
    console.log('Received message:', ctx.message.text);
    ctx.reply('✅ Bot is alive. Use /start to access the dashboard.');
  }
});

// 🌐 Webhook server for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Bot listening on port ${PORT}`);
});

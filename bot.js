require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const { getArbitrageOpportunities } = require('./arbitrageEngine');

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

// /arbs command
bot.command('arbs', async (ctx) => {
  const opportunities = await getArbitrageOpportunities();
  if (!opportunities.length) return ctx.reply('No arbitrage opportunities found.');

  const messages = opportunities.map(o => `
🔁 *${o.pair}*
💱 Buy on ${o.buyExchange} @ ${o.buyPrice}
💸 Sell on ${o.sellExchange} @ ${o.sellPrice}
📊 ROI: ${o.roi}%
📦 Volume: $${o.volume.toLocaleString()}
${o.risk.color} Risk: ${o.risk.level}
⏱ Time Left: ${o.timeLeft}
  `);

  ctx.reply(messages.join('\n\n'), { parse_mode: 'Markdown' });
});

// /Checkarb command
bot.command('Checkarb', async (ctx) => {
  await ctx.reply('🔍 Tap below to check live arbitrage opportunities:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📈 View Opportunities', callback_data: 'fetch_arbs' }]
      ]
    }
  });
});

// Inline button handler
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;
  if (data === 'fetch_arbs') {
    await ctx.answerCbQuery();
    const opportunities = await getArbitrageOpportunities();
    if (!opportunities.length) return ctx.reply('No arbitrage opportunities found.');

    const messages = opportunities.map(o => `
🔁 *${o.pair}*
💱 Buy on ${o.buyExchange} @ ${o.buyPrice}
💸 Sell on ${o.sellExchange} @ ${o.sellPrice}
📊 ROI: ${o.roi}%
📦 Volume: $${o.volume.toLocaleString()}
${o.risk.color} Risk: ${o.risk.level}
⏱ Time Left: ${o.timeLeft}
    `);

    await ctx.reply(messages.join('\n\n'), { parse_mode: 'Markdown' });
  }
});

// Launch bot
bot.launch();

// Keep alive for Render
const app = express();
app.get('/', (req, res) => res.send('Bot is running'));
app.listen(3000, () => console.log('✅ Server listening on port 3000'));

const express = require('express');
const { Telegraf } = require('telegraf');
const { getArbitrageOpportunities } = require('./arbitrageEngine');

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('BOT_TOKEN is missing in environment');

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

// /Checkarb command with inline button
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

// Express setup for webhook
const app = express();
app.use(express.json());
app.use(bot.webhookCallback('/telegram'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on ${PORT}`);
});

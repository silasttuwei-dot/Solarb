// bot.js
const express = require('express');
const { Telegraf } = require('telegraf');
const { getArbitrageOpportunities } = require('./arbitrageEngine');

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

// Telegram command: /arbs
bot.command('arbs', async (ctx) => {
  try {
    const opportunities = await getArbitrageOpportunities();

    if (!opportunities.length) {
      return ctx.reply('No arbitrage opportunities found.');
    }

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
  } catch (err) {
    console.error('Error fetching arbitrage data:', err);
    ctx.reply('❌ Failed to fetch opportunities.');
  }
});

// Launch bot
bot.launch();

// 👇 Express server to bind a port (required by Render)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Solarb bot is running'));
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

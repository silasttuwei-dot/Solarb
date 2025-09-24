// bot.js
const { Telegraf } = require('telegraf');
const { getArbitrageOpportunities } = require('./arbitrageEngine');

const BOT_TOKEN = process.env.BOT_TOKEN || 'your-telegram-bot-token';
const bot = new Telegraf(BOT_TOKEN);

// Format helpers
const formatPercentage = (num) => `${parseFloat(num).toFixed(2)}%`;
const formatNumber = (num) =>
  num >= 1e6 ? `$${(num / 1e6).toFixed(1)}M` :
  num >= 1e3 ? `$${(num / 1e3).toFixed(1)}K` :
  `$${num.toFixed(2)}`;

// /arbs command
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
📊 ROI: ${formatPercentage(o.roi)}
📦 Volume: ${formatNumber(o.volume)}
${o.risk.color} Risk: ${o.risk.level}
⏱ Time Left: ${o.timeLeft}
    `);

    ctx.reply(messages.join('\n\n'), { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Error fetching arbitrage data:', err);
    ctx.reply('❌ Failed to fetch opportunities.');
  }
});

bot.launch();

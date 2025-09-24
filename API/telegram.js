const { Telegraf } = require('telegraf');
const { getArbitrageOpportunities } = require('../arbitrageEngine');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Define commands
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

bot.command('Checkarb', async (ctx) => {
  await ctx.reply('🔍 Tap below to check live arbitrage opportunities:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📈 View Opportunities', callback_data: 'fetch_arbs' }]
      ]
    }
  });
});

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

// Export Vercel-compatible handler
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } else {
    res.status(404).send('Not Found');
  }
};

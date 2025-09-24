const { Telegraf } = require('telegraf');
const { getArbitrageOpportunities } = require('../arbitrageEngine');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Optional: Replace with your own Telegram user ID to receive error logs
const DEBUG_CHAT_ID = '8313048362';

// Error logging to Telegram
bot.catch((err) => {
  bot.telegram.sendMessage(DEBUG_CHAT_ID, `❌ Bot error: ${err.message}`);
});

// /arbs command
bot.command('arbs', async (ctx) => {
  try {
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
  } catch (err) {
    bot.telegram.sendMessage(DEBUG_CHAT_ID, `❌ /arbs error: ${err.message}`);
  }
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
  try {
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
  } catch (err) {
    bot.telegram.sendMessage(DEBUG_CHAT_ID, `❌ Callback error: ${err.message}`);
  }
});

// Vercel-compatible webhook handler
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body);
      res.status(200).send('OK');
    } catch (err) {
      await bot.telegram.sendMessage(DEBUG_CHAT_ID, `❌ Webhook error: ${err.message}`);
      res.status(500).send('Bot error');
    }
  } else {
    res.status(404).send('Not Found');
  }
};

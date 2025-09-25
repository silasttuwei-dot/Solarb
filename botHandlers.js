const { getArbitrageOpportunities } = require('./arbitrageEngine');

function formatTelegramMessage(opps) {
  if (!opps.length) return 'No arbitrage opportunities found at the moment.';

  return opps.map(o => `
🔁 *${o.pair}*
💱 Buy on ${o.buyExchange} @ ${o.buyPrice}
💸 Sell on ${o.sellExchange} @ ${o.sellPrice}
📊 ROI: ${o.roi}%
📦 Volume: $${o.volume.toLocaleString()}
${o.risk.color} Risk: ${o.risk.level}
⏱ Time Left: ${o.timeLeft}
  `).join('\n\n');
}

function registerBotHandlers(bot) {
  bot.on('message', async (msg) => {
    try {
      const opps = await getArbitrageOpportunities();
      const reply = formatTelegramMessage(opps);
      await bot.telegram.sendMessage(msg.chat.id, reply, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('Handler error:', err);
      await bot.telegram.sendMessage(msg.chat.id, 'Sorry, something went wrong 🤖');
    }
  });

  bot.catch((err, ctx) => {
    console.error('❌ Bot error:', err.message);
    if (ctx?.chat?.id) {
      bot.telegram.sendMessage(ctx.chat.id, `⚠️ Bot error: ${err.message}`);
    }
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', async (err) => {
    console.error('Uncaught exception:', err);
    process.exit(1);
  });
}

module.exports = { registerBotHandlers };

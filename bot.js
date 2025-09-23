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

// Restrict access to your chat ID
bot.use((ctx, next) => {
  if (ctx.chat.id.toString() !== process.env.CHAT_ID) return;
  return next();
});

bot.command('scan', async (ctx) => {
  const input = ctx.message.text.split(' ')[1];
  if (!input) return ctx.reply('Please provide a token mint address.');

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
    `);

    // Alert if ROI is high
    if (parseFloat(pnl.roi) > 10) {
      bot.telegram.sendMessage(process.env.CHAT_ID, `🔥 High ROI Alert!\nToken: $${meta.symbol}\nROI: ${pnl.roi}%`);
    }
  } catch (err) {
    ctx.reply('Error scanning token. Check the address and try again.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot listening on port ${PORT}`);
});

require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const { fetchJupiterPrices } = require('./engine');

const bot  = new Telegraf(process.env.BOT_TOKEN);
const app  = express();

bot.command('arb', async ctx => {
  const edges = await fetchJupiterPrices();
  if (!edges.length) return ctx.reply('No edges > 0.1 % right now.');
  const table = edges.map(e =>
    `\`${e.pair}\`  ${e.roi}%  ${e.buyExchange}→${e.sellExchange}  $${e.volume}`
  ).join('\n');
  await ctx.replyWithMarkdown(`📊 Live edges:\n\`\`\`\n${table}\n\`\`\``);
});

bot.launch();
app.get('/', (_, res) => res.send('Bot is running'));
app.listen(3000, () => console.log('✅ Server listening on port 3000'));

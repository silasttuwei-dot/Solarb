require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app  = express();

app.get('/', (_, res) => res.send('Bot is running'));
app.listen(3000, () => console.log('✅ Health check on port 3000'));

bot.command('arb', async ctx => {
  const url = 'https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=10000000&limit=2';
  const q   = await fetch(url).then(r => r.json());
  const a   = q.routePlan[0];
  const b   = q.routePlan[1];
  const spread = ((b.outAmount - a.outAmount) / a.outAmount * 100).toFixed(2);
  if (spread < 0.1) return ctx.reply('No edge > 0.1 % right now.');
  ctx.reply(`SOL/USDC  ${spread}%  ${a.swapInfo.label}→${b.swapInfo.label}`);
});

bot.launch();
console.log('✅ Bot live – type /arb in Telegram');

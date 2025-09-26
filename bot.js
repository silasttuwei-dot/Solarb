require('dotenv').config();
const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('arb', async ctx => {
  try {
    const url = 'https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=10000000&limit=2';
    const q   = await fetch(url).then(r => r.json());
    if (!q.routePlan || q.routePlan.length < 2) return ctx.reply('No multi-route');
    const a = q.routePlan[0];
    const b = q.routePlan[1];
    const spread = ((b.outAmount - a.outAmount) / a.outAmount * 100).toFixed(2);
    if (spread < 0.1) return ctx.reply('No edge > 0.1 % right now.');
    ctx.reply(`SOL/USDC  ${spread}%  ${a.swapInfo.label}→${b.swapInfo.label}`);
  } catch (e) {
    ctx.reply('Error: ' + e.message);
  }
});

bot.launch();
console.log('✅ Bot live – type /arb in Telegram');

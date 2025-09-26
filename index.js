require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const { getQuote } = require('./jupiterAdapter');

const app = express();
app.use(bodyParser.json());

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

bot.onText(/\/debug/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const quote = await getQuote(
      'So11111111111111111111111111111111111111112', // SOL
      'EPjFWdd5AufqSSqeM2qTz1n4KXG6PpXn4Zz4Zz4Zz4Z', // USDC
      1000000000 // 1 SOL in lamports
    );
    bot.sendMessage(chatId, `🧪 Jupiter Quote:\n\n${JSON.stringify(quote, null, 2)}`);
  } catch (err) {
    bot.sendMessage(chatId, `❌ Error:\n${err.message}`);
  }
});

app.post(`/bot${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Bot server running on port ${PORT}`);
});

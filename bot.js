require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const { registerBotHandlers } = require('./botHandlers');

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

registerBotHandlers(bot);
bot.launch();

const app = express();
app.get('/', (req, res) => res.send('Bot is running'));
app.listen(3000, () => console.log('✅ Server listening on port 3000'));

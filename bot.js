require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const { registerBotHandlers } = require('./botHandlers'); // ← ONE file only

const bot = new Telegraf(process.env.BOT_TOKEN);
registerBotHandlers(bot);
bot.launch();

const app = express();
app.get('/', (_, res) => res.send('Bot is running'));
app.listen(3000, () => console.log('✅ Server listening on port 3000'));

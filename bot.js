const TelegramBot = require('node-telegram-bot-api');
const debugCommand = require('./commands/debug');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

bot.onText(/\/debug/, debugCommand(bot));

module.exports = bot;

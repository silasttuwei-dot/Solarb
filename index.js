require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bot = require('./src/bot/bot');

const app = express();
app.use(bodyParser.json());

app.post(`/bot${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Bot server running on port ${PORT}`);
});

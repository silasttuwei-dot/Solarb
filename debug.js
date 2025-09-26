const { getQuote: getJupiterQuote } = require('../../dex/jupiterAdapter');
const { getRaydiumQuote } = require('../../dex/raydiumAdapter');
const { getOrcaQuote } = require('../../dex/orcaAdapter');

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qTz1n4KXG6PpXn4Zz4Zz4Zz4Z';
const AMOUNT = 1000000000;

module.exports = (bot) => async (msg) => {
  const chatId = msg.chat.id;
  try {
    const [jupiter, raydium, orca] = await Promise.all([
      getJupiterQuote(SOL_MINT, USDC_MINT, AMOUNT),
      getRaydiumQuote(SOL_MINT, USDC_MINT, AMOUNT),
      getOrcaQuote(SOL_MINT, USDC_MINT, AMOUNT)
    ]);

    const response = {
      Jupiter: jupiter,
      Raydium: raydium,
      Orca: orca
    };

    bot.sendMessage(chatId, `🧪 Live DEX Quotes:\n\n${JSON.stringify(response, null, 2)}`);
  } catch (err) {
    bot.sendMessage(chatId, `❌ Error fetching quotes:\n${err.message}`);
  }
};

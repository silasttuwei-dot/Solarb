// botHandlers.js  (final live version)
const { fetchJupiterPrices } = require('./dexPrices'); // live cross-DEX edges

function formatOpportunity(op) {
  return `\`${op.pair}\`  ${op.roi}%  ${op.buyExchange}→${op.sellExchange}  ${op.volume} USD  ${op.risk.color}`;
}

module.exports.registerBotHandlers = (bot) => {
  bot.start((ctx) => ctx.reply('🤖 Solarb live – type /arb to see current edges.'));

  bot.command('arb', async (ctx) => {
    try {
      const edges = await fetchJupiterPrices(); // already filtered & sorted
      if (!edges.length) return ctx.reply('No edges > 0.15 % right now.');

      const table = edges.map(formatOpportunity).join('\n');
      await ctx.replyWithMarkdown(`📊 Live edges (net of 0.1 % fee):\n\`\`\`\n${table}\n\`\`\``);
    } catch (e) {
      console.error('Handler error:', e);
      await ctx.reply('Sorry, something went wrong 🤖');
    }
  });

  bot.help((ctx) => ctx.reply('Commands:\n/arb – show arbitrage edges\n/help – this message'));
};

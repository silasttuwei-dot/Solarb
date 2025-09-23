const fetch = require('node-fetch');

const TOKEN_LIST_URL = 'https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json';

async function getTokenMeta(mint) {
  const res = await fetch(TOKEN_LIST_URL);
  const list = await res.json();
  const token = list.tokens.find(t => t.address === mint);
  if (!token) throw new Error('Token not found');
  return { symbol: token.symbol, name: token.name, decimals: token.decimals };
}

module.exports = { getTokenMeta };

const fetch = require('node-fetch');

const JUPITER_API = 'https://quote-api.jup.ag/v6';

async function getQuote(inputMint, outputMint, amount) {
  const res = await fetch(`${JUPITER_API}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippage=1`);
  if (!res.ok) throw new Error(`Jupiter API error: ${res.status}`);
  const data = await res.json();
  return data;
}

module.exports = { getQuote };

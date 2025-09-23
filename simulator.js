const anchor = require('@coral-xyz/anchor');
const { Connection } = require('@solana/web3.js');

async function simulateArbitrage(buyPrice, sellPrice, flashloanFee) {
  const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
  const wallet = anchor.Wallet.local();
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  anchor.setProvider(provider);

  const program = anchor.workspace.ArbSimulator;

  await program.methods
    .simulateArbitrage(
      new anchor.BN(buyPrice * 1e6),
      new anchor.BN(sellPrice * 1e6),
      new anchor.BN(flashloanFee * 1e6)
    )
    .accounts({})
    .rpc();

  return `Simulated arbitrage with buy=${buyPrice}, sell=${sellPrice}, fee=${flashloanFee}`;
}

module.exports = { simulateArbitrage };

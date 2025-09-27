#!/bin/bash
# Run on Android (Termux) or iOS (iSH)
echo "🔍 Checking high-volume arbitrage opportunities..."
echo "----------------------------------------"

# USDC/PYTH
echo "USDC/PYTH:"
curl -s "https://quote-api.jup.ag/v6/quote?inputMint=HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7koU&amount=1000000000" | grep -o '"outAmount":[0-9]*' | cut -d: -f2 | xargs -I {} echo "  Sell PYTH: \$"$(echo "scale=6; {}/1000000" | bc)
curl -s "https://quote-api.jup.ag/v6/quote?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7koU&outputMint=HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3&amount=1000000" | grep -o '"outAmount":[0-9]*' | cut -d: -f2 | xargs -I {} echo "  Buy PYTH: \$"$(echo "scale=9; {}/1000000000" | bc) | xargs -I {} echo "  Implied: \$"$(echo "scale=6; 1/{}" | bc)

echo ""
# USDT/WIF
echo "USDT/WIF:"
curl -s "https://quote-api.jup.ag/v6/quote?inputMint=EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm&outputMint=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB&amount=1000000000" | grep -o '"outAmount":[0-9]*' | cut -d: -f2 | xargs -I {} echo "  Sell WIF: \$"$(echo "scale=6; {}/1000000" | bc)
curl -s "https://quote-api.jup.ag/v6/quote?inputMint=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB&outputMint=EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm&amount=1000000" | grep -o '"outAmount":[0-9]*' | cut -d: -f2 | xargs -I {} echo "  Buy WIF: \$"$(echo "scale=9; {}/1000000000" | bc) | xargs -I {} echo "  Implied: \$"$(echo "scale=6; 1/{}" | bc)

import os
from flask import Flask, jsonify, render_template_string
import requests

app = Flask(__name__)

# High-volume tokens (Sept 2025) - verified via Jupiter token list
TOKENS = {
    "USDC": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7koU",
    "USDT": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    "PYTH": "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
    "WIF": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    "RAY": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3WiWWU2",
    "BONK": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnntXxTCZxg8GC",
    "SOL": "So11111111111111111111111111111111111111112"
}

def get_price(input_mint, output_mint, amount):
    """Get executable price from Jupiter"""
    url = f"https://quote-api.jup.ag/v6/quote?inputMint={input_mint}&outputMint={output_mint}&amount={amount}"
    try:
        resp = requests.get(url, timeout=3)
        if resp.status_code == 200:
            data = resp.json()
            out_amount = int(data["outAmount"])
            output_decimals = 6 if output_mint in [TOKENS["USDC"], TOKENS["USDT"]] else 9
            return out_amount / (10 ** output_decimals)
    except:
        pass
    return None

@app.route("/api/opportunities")
def opportunities():
    pairs = [
        ("PYTH", "USDC"),
        ("WIF", "USDT"),
        ("BONK", "RAY"),
        ("PYTH", "SOL")
    ]
    
    results = []
    for token_a, token_b in pairs:
        mint_a = TOKENS[token_a]
        mint_b = TOKENS[token_b]
        
        # Sell token_a → token_b
        sell_price = get_price(mint_a, mint_b, 1_000_000_000)  # 1 token_a
        
        # Buy token_a ← token_b
        buy_resp = get_price(mint_b, mint_a, 1_000_000)  # 1 token_b
        buy_price = 1 / (buy_resp / 1e9) if buy_resp else None
        
        if sell_price and buy_price:
            profit_pct = ((sell_price - buy_price) / buy_price) * 100
            if profit_pct > 0.5:  # Only show >0.5% profit
                results.append({
                    "pair": f"{token_a}/{token_b}",
                    "buy_price": round(buy_price, 6),
                    "sell_price": round(sell_price, 6),
                    "profit_pct": round(profit_pct, 2)
                })
    
    return jsonify(results)

@app.route("/")
def dashboard():
    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Arb Monitor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { background: #0f0c14; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 1rem; }
            h1 { font-size: 1.5rem; margin-bottom: 1rem; }
            p { color: #a0a0a0; font-size: 0.95rem; margin-bottom: 1.5rem; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th, td { padding: 0.75rem 0.5rem; text-align: left; border-bottom: 1px solid #2a2438; font-size: 0.9rem; }
            .profit { color: #ff6b6b; font-weight: bold; }
            .last-update { color: #4ecdc4; font-size: 0.85rem; margin-top: 1rem; }
            .no-data { text-align: center; color: #6c757d; padding: 1.5rem; }
        </style>
    </head>
    <body>
        <h1>Live Arbitrage Opportunities</h1>
        <p>Filtered: High-volume tokens only • Updates every 10s</p>
        
        <table id="opportunities">
            <thead>
                <tr><th>Pair</th><th>Buy Price</th><th>Sell Price</th><th>Profit %</th></tr>
            </thead>
            <tbody></tbody>
        </table>
        <div class="last-update">Last update: <span id="time">Loading...</span></div>

        <script>
            async function update() {
                try {
                    const res = await fetch('/api/opportunities');
                    const data = await res.json();
                    const tbody = document.querySelector('tbody');
                    tbody.innerHTML = '';
                    
                    if (data.length === 0) {
                        const row = document.createElement('tr');
                        row.innerHTML = `<td colspan="4" class="no-data">No opportunities >0.5% profit</td>`;
                        tbody.appendChild(row);
                    } else {
                        data.forEach(op => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${op.pair}</td>
                                <td>$${op.buy_price}</td>
                                <td>$${op.sell_price}</td>
                                <td class="profit">+${op.profit_pct}%</td>
                            `;
                            tbody.appendChild(row);
                        });
                    }
                    document.getElementById('time').textContent = new Date().toLocaleTimeString();
                } catch (e) {
                    console.error("Fetch error:", e);
                    const tbody = document.querySelector('tbody');
                    tbody.innerHTML = `<tr><td colspan="4" class="no-data">Error loading data</td></tr>`;
                }
            }
            update();
            setInterval(update, 10000);
        </script>
    </body>
    </html>
    """)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)

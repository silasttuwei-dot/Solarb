import requests
import math
import os
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# ✅ Set your bot token
BOT_TOKEN = os.getenv("BOT_TOKEN") or "your-telegram-bot-token"
RPC_URL = "https://api.mainnet-beta.solana.com"

# 🧠 Swap simulator
def simulate_swap(x, y, dx, fee=0.003):
    dx_after_fee = dx * (1 - fee)
    dy = (dx_after_fee * y) / (x + dx_after_fee)
    return dy

# 🔒 Hardcoded Orca pool fallback
def find_orca_pool(token_mint):
    POOLS = [
        {
            "poolAddress": "8sFqzZ5eZkZ7ZzZ5eZkZ7ZzZ5eZkZ7ZzZ5eZkZ7ZzZ5eZkZ7Zz",  # ✅ Replace with actual verified address
            "tokenA": {
                "mint": "So11111111111111111111111111111111111111112",
                "symbol": "SOL",
                "decimals": 9
            },
            "tokenB": {
                "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                "symbol": "USDC",
                "decimals": 6
            }
        }
    ]

    for pool in POOLS:
        tokenA = pool["tokenA"]
        tokenB = pool["tokenB"]
        if token_mint in [tokenA["mint"], tokenB["mint"]]:
            return pool
    return None

# 🧪 /validate command
async def validate(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if len(context.args) == 0:
        await update.message.reply_text("❗ Please provide a token mint address.")
        return

    mint = context.args[0]
    pool = find_orca_pool(mint)
    if not pool:
        await update.message.reply_text("❌ No hardcoded Orca pool found for this token.")
        return

    pool_address = pool["poolAddress"]
    tokenA = pool["tokenA"]
    tokenB = pool["tokenB"]
    decimals = tokenB["decimals"] if tokenA["mint"] == "So11111111111111111111111111111111111111112" else tokenA["decimals"]

    rpc_payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getAccountInfo",
        "params": [pool_address, {"encoding": "base64"}]
    }

    try:
        res = requests.post(RPC_URL, json=rpc_payload)
        data = res.json()

        if not data.get("result") or not data["result"].get("value"):
            await update.message.reply_text("❌ RPC returned no data. Pool may be inactive.")
            return

        buffer = data["result"]["value"]["data"][0]
        raw = bytearray(buffer.encode("utf-8"))
        reserveA = int.from_bytes(raw[64:72], "little")
        reserveB = int.from_bytes(raw[72:80], "little")

        is_sol_A = tokenA["mint"] == "So11111111111111111111111111111111111111112"
        sol_reserve = reserveA if is_sol_A else reserveB
        token_reserve = reserveB if is_sol_A else reserveA

        sol = sol_reserve / 1e9
        token = token_reserve / math.pow(10, decimals)
        input_amount = 1

        buy_amount = simulate_swap(sol, token, input_amount)
        sell_amount = simulate_swap(token, sol, buy_amount)
        roi = ((sell_amount - input_amount) / input_amount) * 100

        symbol = tokenB["symbol"] if tokenA["symbol"] == "SOL" else tokenA["symbol"]
        await update.message.reply_text(
            f"✅ Token: ${symbol}\n"
            f"💱 Buy: 1 SOL → {buy_amount:.4f} tokens\n"
            f"💸 Sell: {buy_amount:.4f} tokens → {sell_amount:.4f} SOL\n"
            f"📊 ROI: {roi:.2f}%\n"
            f"✅ Liquidity: {token:.0f} tokens in pool"
        )
    except Exception as e:
        await update.message.reply_text(f"❌ Validation failed: {str(e)}")

# 🚀 Launch bot
def main():
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("validate", validate))
    app.run_polling()

if __name__ == "__main__":
    main()

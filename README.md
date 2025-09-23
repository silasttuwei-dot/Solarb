# Telegram Arbitrage Bot

This project is a Telegram bot deployed with FastAPI and Render.com that scans for arbitrage opportunities across DEXs.

## Features

- Telegram bot responds to `/start` and contract address messages
- Scans UniswapV2, SushiSwap, PancakeSwap for arbitrage routes
- Deployable on Render or other cloud platforms

## Setup

1. Clone the repository.
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Set these environment variables:
   - `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
   - `WEBHOOK_URL` - Your public webhook endpoint (e.g., `https://your-app.onrender.com/webhook`)

4. Start the app:
   ```
   python main.py
   ```
   Or, for deployment:
   ```
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## Project Files

- `main.py` – FastAPI server and Telegram webhook integration
- `arbitrage.py` – Logic for scanning arbitrage routes
- `dex.py` – Fetches prices from DEX APIs

## Notes

- Make sure your webhook is set to your deployed URL.
- The bot uses dummy trade simulation for arbitrage (no live trading).

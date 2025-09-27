# Lovable Arb Monitor

A self-hosted, mobile-friendly arbitrage monitor for high-volume Solana tokens.

## Features
- Filters for tokens with >$100k daily volume
- Shows only opportunities with >0.5% profit
- Works on Render (free) or your VPS
- Mobile-ready dashboard

## Deploy to Render (Free)
1. Create a new GitHub repo
2. Add all files from this folder
3. Go to [Render](https://render.com) → New Web Service
4. Connect your repo
5. Set:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Port**: `10000`
6. Click **Create**

## Run on Smartphone
1. Install **Termux** (Android) or **iSH** (iOS)
2. Run:
   ```bash
   pkg install curl bc  # Android
   apk add curl bc      # iOS

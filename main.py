import os
import logging
from fastapi import FastAPI, Request
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, ContextTypes, filters
from arbitrage import scan_arbitrage_opportunities

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "https://solarb.onrender.com/webhook")  # Update as needed

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
telegram_app = None

@app.on_event("startup")
async def startup_event():
    global telegram_app
    telegram_app = ApplicationBuilder().token(BOT_TOKEN).build()
    telegram_app.add_handler(CommandHandler("start", start))
    telegram_app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_contract))
    await telegram_app.initialize()
    await telegram_app.bot.set_webhook(WEBHOOK_URL)
    logger.info("Telegram bot webhook set!")

@app.get("/")
async def read_root():
    return {"status": "ok"}

@app.post("/webhook")
async def telegram_webhook(request: Request):
    global telegram_app
    data = await request.json()
    await telegram_app.process_update(data)
    return {"ok": True}

async def start(update, context):
    await update.message.reply_text("Send a contract address to scan for arbitrage opportunities.")

async def handle_contract(update, context):
    contract = update.message.text.strip()
    await update.message.reply_text("Scanning DEXs for arbitrage routes for: " + contract)
    result = await scan_arbitrage_opportunities(contract)
    await update.message.reply_text(result)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get('PORT', 8000)), log_level="info")

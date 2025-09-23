import os
import logging
import asyncio
from fastapi import FastAPI
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, ContextTypes, filters
from arbitrage import scan_arbitrage_opportunities
import uvicorn

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
PORT = int(os.environ.get('PORT', 8000))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "ok"}

async def start(update: 'Update', context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Send a contract address to scan for arbitrage opportunities.")

async def handle_contract(update: 'Update', context: ContextTypes.DEFAULT_TYPE):
    contract = update.message.text.strip()
    await update.message.reply_text("Scanning DEXs for arbitrage routes for: " + contract)
    result = await scan_arbitrage_opportunities(contract)
    await update.message.reply_text(result)

async def telegram_bot():
    application = ApplicationBuilder().token(BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_contract))
    logger.info("Telegram bot started!")
    await application.initialize()
    await application.start()
    await application.updater.start_polling()
    await application.updater.idle()

async def main():
    # Run uvicorn server and Telegram bot concurrently
    server = uvicorn.Server(config=uvicorn.Config(app, host="0.0.0.0", port=PORT, log_level="info"))
    tg_task = asyncio.create_task(telegram_bot())
    server_task = asyncio.create_task(server.serve())
    await asyncio.gather(server_task, tg_task)

if __name__ == "__main__":
    asyncio.run(main())

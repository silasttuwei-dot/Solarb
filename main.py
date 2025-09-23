import os
import logging
import subprocess
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, ContextTypes, filters
from arbitrage import scan_arbitrage_opportunities

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
PORT = int(os.environ.get('PORT', 8000))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def start_uvicorn():
    import sys
    subprocess.Popen([sys.executable, "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", str(PORT)])

async def start(update, context):
    await update.message.reply_text("Send a contract address to scan for arbitrage opportunities.")

async def handle_contract(update, context):
    contract = update.message.text.strip()
    await update.message.reply_text(f"Scanning DEXs for arbitrage routes for: {contract}")
    result = await scan_arbitrage_opportunities(contract)
    await update.message.reply_text(result)

def main():
    start_uvicorn()

    application = ApplicationBuilder().token(BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_contract))
    logger.info("Telegram bot started!")
    application.run_polling()

if __name__ == "__main__":
    main()

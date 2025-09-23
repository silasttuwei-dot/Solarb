import os
import logging
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

from arbitrage import scan_arbitrage_opportunities

# Load secrets from env
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Send a contract address to scan for arbitrage opportunities.")

async def handle_contract(update: Update, context: ContextTypes.DEFAULT_TYPE):
    contract = update.message.text.strip()
    await update.message.reply_text("Scanning DEXs for arbitrage routes for: " + contract)
    result = await scan_arbitrage_opportunities(contract)
    await update.message.reply_text(result)

def main():
    application = ApplicationBuilder().token(BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_contract))
    logger.info("Bot started!")
    application.run_polling()

if __name__ == "__main__":
    main()

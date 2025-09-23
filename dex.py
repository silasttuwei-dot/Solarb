import aiohttp

DEX_ENDPOINTS = {
    "UniswapV2": "https://api.geckoterminal.com/api/v2/networks/ethereum/pools/{contract}",
    "SushiSwap": "https://api.geckoterminal.com/api/v2/networks/ethereum/pools/{contract}",
    "PancakeSwap": "https://api.geckoterminal.com/api/v2/networks/bsc/pools/{contract}"
}

async def fetch_price_from_geckoterminal(dex, contract_address):
    url = DEX_ENDPOINTS[dex].format(contract=contract_address)
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            if resp.status != 200:
                return None
            data = await resp.json()
            try:
                price = float(data["data"]["attributes"]["token0_price_usd"])
                return price
            except Exception:
                return None

async def fetch_prices(contract_address):
    prices = {}
    for dex in DEX_ENDPOINTS:
        price = await fetch_price_from_geckoterminal(dex, contract_address)
        if price:
            prices[dex] = price
    return prices

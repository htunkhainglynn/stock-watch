const BuyStockDto = require('../dto/buyStock');
const stockService = require('../service/StockService');

async function getStockBySymbolHandler(req, res, next) {
    const symbol = req.query['symbol'];
    const stock = await stockService.getStockBySymbol(symbol);
    if(!stock) {
        res.status(404).json({error: 'Stock not found'});
    }
    await res.status(200).json(stock);
}

async function buyStockHandler(req, res, next) {
    const buyStockDto = new BuyStockDto(req.body);

    try{
        const stock = await stockService.buyStock(buyStockDto);
        res.status(200).json(stock);
    }
    catch {
        res.status(400).json({error: 'Error buying stock'});
    }
}

async function sellStockHandler() {
    
}

module.exports = {
    getStockBySymbolHandler,
    buyStockHandler,
    sellStockHandler
};
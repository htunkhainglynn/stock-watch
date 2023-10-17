const stockService = require('../service/StockService');
const {json} = require("express");

async function getStockBySymbolHandler(req, res, next) {
    const symbol = req.query['symbol'];
    const stock = await stockService.getStockBySymbol(symbol);
    if(!stock) {
        res.status(404).json({error: 'Stock not found'});
    }
    await res.status(200).json(stock);
}

module.exports = {
    getStockBySymbolHandler
};
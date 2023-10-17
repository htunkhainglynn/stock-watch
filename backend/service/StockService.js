const finnhub = require('finnhub');
const util = require('util');
const Stock = require('../model/Stock');

const finnhubClient = new finnhub.DefaultApi();
const symbolSearchPromise = util.promisify(finnhubClient.symbolSearch).bind(finnhubClient);
const quotePromise = util.promisify(finnhubClient.quote).bind(finnhubClient);

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = "ckm1ef9r01qu6et4ri10ckm1ef9r01qu6et4ri1g"

const result = {};

async function getStockBySymbol(symbol) {
    try {
        const symbolSearchPromiseResult = symbolSearchPromise(symbol.toUpperCase());
        const quotePromiseResult = quotePromise(symbol.toUpperCase());

        const [symbolSearchResult, quoteResult] = await Promise.all([symbolSearchPromiseResult, quotePromiseResult]);

        result.companyName = symbolSearchResult.result[0].description;
        result.currentPrice = quoteResult.c;
        result.symbol = symbolSearchResult.result[0].symbol;

        return result;
    } catch (error) {
        return undefined;
    }
}

async function buyStock(buyStockDto) {
    try {
        const symbolSearchPromiseResult = symbolSearchPromise(buyStockDto.symbol.toUpperCase());
        const quotePromiseResult = quotePromise(buyStockDto.symbol.toUpperCase());

        const [symbolSearchResult, quoteResult] = await Promise.all([symbolSearchPromiseResult, quotePromiseResult]);

        const newStock = new Stock({
            company: symbolSearchResult.result[0].description,
            symbol: symbolSearchResult.result[0].symbol,
            quantity: buyStockDto.quantity,
            purchasePrice: quoteResult.c,
            user: buyStockDto.userId
        });

        await newStock.save();
        return newStock.populate('User');
    } catch (error) {
        return undefined;
    }
}


module.exports = {
    getStockBySymbol,
    buyStock
};

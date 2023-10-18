const finnhub = require('finnhub');
const util = require('util');
const Stock = require('../model/Stock');
const User = require('../model/User');
const History = require('../model/History');
const mongoose = require('mongoose');

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
    const symbolSearchPromiseResult = symbolSearchPromise(buyStockDto.symbol.toUpperCase());
    const quotePromiseResult = quotePromise(buyStockDto.symbol.toUpperCase());

    let [symbolSearchResult, quoteResult] = await Promise.all([symbolSearchPromiseResult, quotePromiseResult]);

    symbolSearchResult = symbolSearchResult.result.filter(result => result.symbol === buyStockDto.symbol.toUpperCase())[0];

    // add to history
    const history = new History({
        company: symbolSearchResult.description,
        symbol: symbolSearchResult.symbol,
        quantity: buyStockDto.quantity,
        purchasePrice: quoteResult.c,
        user: mongoose.isValidObjectId(buyStockDto.user)
            ? buyStockDto.user : new mongoose.Types.ObjectId(buyStockDto.user)  // above mongoose version 6
    });

    await history.save();

    // find existing stock, if exists, update quantity, else create new stock
    let newStock = {};
    const existingStock = await Stock.findOne({ symbol: symbolSearchResult.symbol, user: buyStockDto.user });
    if (existingStock) {
        existingStock.quantity += buyStockDto.quantity;
        await existingStock.save();
    } else {
        newStock = new Stock({
            company: symbolSearchResult.description,
            symbol: symbolSearchResult.symbol,
            quantity: buyStockDto.quantity,
            user: mongoose.isValidObjectId(buyStockDto.user)
                ? buyStockDto.user : new mongoose.Types.ObjectId(buyStockDto.user)  // above mongoose version 6
        });
        await newStock.save();
    }

    // update user balance
    const user = await User.findById(buyStockDto.user);
    if (!user) {
        throw new Error('User not found');
    }

    const cost = buyStockDto.quantity * quoteResult.c;
    if (user.balance < cost) {
        throw new Error('Insufficient funds');
    }

    user.balance -= cost;
    await user.save();

    return existingStock || newStock;
}

module.exports = {
    getStockBySymbol,
    buyStock
};

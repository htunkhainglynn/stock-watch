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

        let [symbolSearchResult, quoteResult] = await Promise.all([symbolSearchPromiseResult, quotePromiseResult]);

        symbolSearchResult = symbolSearchResult.result.filter(result => result.symbol === symbol.toUpperCase())[0];

        result.companyName = symbolSearchResult.description;
        result.currentPrice = quoteResult.c;
        result.symbol = symbolSearchResult.symbol;

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
    
    if (!symbolSearchResult) {
        throw new Error('Stock not found');
    }

    // add to history
    const history = new History({
        company: symbolSearchResult.description,
        symbol: symbolSearchResult.symbol,
        quantity: buyStockDto.quantity,
        price: quoteResult.c,
        type: 'buy',
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

async function sellStock(body) {
    // find stock based on symbol and user
    const stock = await Stock.findOne({ symbol: body.symbol, user: body.user });
    const user = await User.findById(body.user);

    if (!stock || stock.quantity < body.quantity) {
        throw new Error('Insufficient stocks');
    }

    const currentPrice = await getCurrentPrice(body.symbol);

    // add to history
    const history = new History({
        company: stock.company,
        symbol: stock.symbol,
        quantity: body.quantity,
        price: currentPrice,
        type: 'sell',
        user: mongoose.isValidObjectId(body.user) ? body.user : new mongoose.Types.ObjectId(body.user)  // above mongoose version 6
    });

    await history.save();

    // update user balance and stock quantity
    user.balance += currentPrice * body.quantity;
    await user.save();

    // delete stock if quantity is 0
    stock.quantity -= body.quantity;
    await stock.save();

    if (stock.quantity === 0) {
        await Stock.deleteOne({ symbol: body.symbol, user: body.user });
    }

    // return stock
    return stock;
}

async function getCurrentPrice(symbol) {
    const quoteResult = await quotePromise(symbol.toUpperCase());
    return quoteResult.c;
}


module.exports = {
    getStockBySymbol,
    buyStock,
    sellStock
};

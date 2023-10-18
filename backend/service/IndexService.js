const finnhub = require('finnhub');
const util = require('util');
const Stock = require('../model/Stock');
const User = require('../model/User');

const finnhubClient = new finnhub.DefaultApi();
const quotePromise = util.promisify(finnhubClient.quote).bind(finnhubClient);
const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = "ckm1ef9r01qu6et4ri10ckm1ef9r01qu6et4ri1g"

async function getData(user) {
    const userId = user.user;
    
    const stocks = await Stock.find({ user: userId });
    const userBalance = await User.findById({ _id: userId }).select('balance');

    // Create an array of promises for fetching current prices
    const currentPricePromises = stocks.map(stock => getCurrentPrice(stock.symbol));

    // Wait for all current prices to be resolved
    const currentPrices = await Promise.all(currentPricePromises);

    return {
        stocks: stocks.map((stock, index) => {
            return {
                symbol: stock.symbol,
                quantity: stock.quantity,
                currentPrice: currentPrices[index],
                companyName: stock.company
            }
        }),
        currentBalance: Math.round(userBalance.balance * 100) / 100,
    }
}

async function getCurrentPrice(symbol) {
    try {
        const quoteResult = await quotePromise(symbol.toUpperCase());
        return quoteResult.c;
    } catch (error) {
        console.error(`Error fetching current price for ${symbol}:`, error);
        return null;
    }
}


module.exports = {
    getData
}
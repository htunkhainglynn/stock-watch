var express = require('express');
var router = express.Router();
const stocks = require('../controller/StockController');

router.get('/', stocks.getStockBySymbolHandler);
router.get('/buy', stocks.buyStockHandler)

module.exports = router;
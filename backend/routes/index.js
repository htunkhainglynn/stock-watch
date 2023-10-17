var express = require('express');
var router = express.Router();
const index = require('../controller/IndexHandler');

/* GET home page. */
router.get('/', index.getIndexHandler);

module.exports = router;

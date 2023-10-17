var express = require('express');
var router = express.Router();
var users = require('../controller/UserController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/sign-in')

router.post('/sign-up', users.signupHandler)

module.exports = router;
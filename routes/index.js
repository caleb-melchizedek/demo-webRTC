var express = require('express');
var router = express.Router();
var signup_handler = require('../config/db_ops/signup_handler');
var login_handler = require('../config/db_ops/login_handler');
var videopage = require('./new');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Video chat' });
});

router.get('/new/:user_id', videopage);

//login
router.post('/login',login_handler);

//signup
router.post('/signup',signup_handler);

module.exports = router;

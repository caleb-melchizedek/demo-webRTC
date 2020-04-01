var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
 // res.io.emit("socketToMe", "index page");
  res.render('index', { title: 'Express'});
});

module.exports = router;

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.flash('info'));
  
  res.render('index.njk', { message: req.flash('info') });
});

module.exports = router;

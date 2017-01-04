var express = require('express');
var router = express.Router();
var awsinfo_config = require('../config/awsinfo_config.json');

var url = awsinfo_config.url;

router.get('/', function (req, res, next) {
    res.render('main',
  {
    urls : url
  });
});

module.exports = router;

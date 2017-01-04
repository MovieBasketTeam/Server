var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var db_config = require('../config/db_config.json');
var awsinfo_config = require('../config/awsinfo_config.json');
var url = awsinfo_config.url;
router.get('/', function (req, res, next) {

    res.render('login', { urls : url });
});


module.exports = router;

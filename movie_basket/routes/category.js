var express = require('express');
var mysql = require('mysql');
var db_config = require('../config/db_config.json');
var awsinfo_config = require('../config/awsinfo_config.json');
var Category = require('../models/category');
var router = express.Router();

var pool = mysql.createPool({
  host : db_config.host,
  port : db_config.port,
  user : db_config.user,
  password : db_config.password,
  database : db_config.database,
  connectionLimit : db_config.connectionLimit
});

router.get('/', function (req, res, next) {
    Category.category(function (error, results) {
        if (error) {
            console.log("Connection error " + error);
            res.status(500).send({results :error});
        }
        else {
          // res.render('category', { categorys : results });
          res.render('category',
          {
            baskets : results.baskets,
            categories : results.categories,
            urls : awsinfo_config.url
          });
        }
    });
});

router.post('/', function(req, res, next) {
    var info = {
        checks : req.body["check[]"],
        basket : req.body["basket[]"][0]
    }
    Category.updateCategoryList(info, function (error, results) {
        if (error) {
            console.log("Connection error " + error);
            res.send(error);
        }
        else {
            res.send(results);
        }
    });
});

module.exports = router;

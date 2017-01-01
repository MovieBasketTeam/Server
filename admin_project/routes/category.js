var express = require('express');
var mysql = require('mysql');
var db_config = require('../config/db_config.json');
var awsinfo_config = require('../config/awsinfo_config.json');
var Search = require('../models/category');
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
    Search.category(function (error, results) {
        if (error) {
            console.log("Connection error " + error);
            res.send(error);
        }
        else {
          // res.render('category', { categorys : results });
          res.render('category',
          {
            title : '바스켓 카테고리 설정 페이지'
            baskets : results.baskets,
            categories : results.categories
          });
          //res.send({result : results});
          //   res.render('category',
          // {
          //   title : '바스켓 카테고리 설정 페이지'
          //   categorys : results
          // });
        }
    });
});

router.post('/', function(req, res, next) {
  //console.log(req.body);
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      connection.release();
      res.sendStatus(500);
    }
    else{
        sql = 'UPDATE basket SET basket_rank = CASE basket_id ';
        for( var i =0; i < req.body["rank[]"].length; i++){
            console.log(req.body["rank[]"][i]);
            var newRank = req.body["rank[]"][i];
            sql += 'WHEN '+(i+1)+' THEN '+newRank+' '
        }
        sql += 'ELSE basket_rank END';
        console.log(sql);
            connection.query(sql, function(error, rows){
                if (error){
                  console.log("Connection Error" + error);
                  connection.release();
                  res.sendStatus(500);
                }
                else {
                  connection.release();
                  res.send({result : rows});
            }
          });
    }
  });
});

module.exports = router;

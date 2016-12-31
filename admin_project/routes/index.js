var express = require('express');
var mysql = require('mysql');
var db_config = require('../config/db_config.json');
var awsinfo_config = require('../config/awsinfo_config.json');
var router = express.Router();


var pool = mysql.createPool({
  host : db_config.host,
  port : db_config.port,
  user : db_config.user,
  password : db_config.password,
  database : db_config.database,
  connectionLimit : db_config.connectionLimit
});


router.get('/', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      connection.release();
      res.sendStatus(500);
    }
    else{
        sql = 'select small_category from category';
      connection.query(sql, function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          connection.release();
          res.sendStatus(500);
        }
        else {
          connection.release();
          console.log(rows);
          res.render('index',
            {
              title : '오늘 추천 카테고리',
              baskets : rows
            }
          );
        }
      });
    }
  });
});

router.post('/', function(req, res, next) {
  var info = {
    req.bodyParser.job.value()
  };
  console.log(info);
  res.send({result : 'ok'});

  });


module.exports = router;

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

var url = awsinfo_config.url;

router.get('/', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      connection.release();
      res.sendStatus(500);
    }
    else{
        sql = 'select small_category, c_id from category order by c_id ASC';
      connection.query(sql, function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          connection.release();
          res.sendStatus(500);
        }
        else {
          connection.release();
          length = rows.length;
          res.render('todayRecommend',
            {
              title : '오늘의 추천 카테고리 설정',
              categories : rows,
              urls : url
            }
          );
        }
      });
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
        sql = 'UPDATE category SET today_recommand = CASE c_id '
        console.log(req.body["check[]"].length);
        for( var i =0; i < req.body["check[]"].length; i++){
            sql += 'WHEN '+ req.body["check[]"][i] +' THEN '+ 1 +' ';
        }
        sql += 'ELSE 0 END';

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

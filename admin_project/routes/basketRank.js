var express = require('express');
var mysql = require('mysql');
//var multerS3 = require('multer-s3');
var db_config = require('../config/db_config.json');
var awsinfo_config = require('../config/awsinfo_config.json');
var router = express.Router();

var length = '';
/*
var s3 = new aws.S3();

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'minha',
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now() + '.' + file.originalname.split('.').pop());
    }
  })
});
*/


var pool = mysql.createPool({
  host : db_config.host,
  port : db_config.port,
  user : db_config.user,
  password : db_config.password,
  database : db_config.database,
  connectionLimit : db_config.connectionLimit
});


//
router.get('/', function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      connection.release();
      res.sendStatus(500);
    }
    else{
        sql = 'select basket_id, basket_name, basket_rank from basket order by basket_id ASC';
      connection.query(sql, function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          connection.release();
          res.sendStatus(500);
        }
        else {
          connection.release();
          length = rows.length;
          res.render('basketRank',
            {
              title : '바스켓 랭킹 설정 페이지',
              baskets : rows
            }
          );
        }
      });
    }
  });
});
;
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
                  // res.status(201).send({result : 'create'});
                  connection.release();
                  // res.render('basketRank',
                  //   {
                  //     title : '바스켓 랭킹 설정 페이지',
                  //     baskets : rows
                  //   }
                  // );
                  res.send({result : rows});
            }
          });
    }
  });
});


// router.post('/', function(req, res, next) {
//   console.log(req.body);
//   res.send({result : 'ok'});
//   // pool.getConnection(function(error, connection){
//   //   if (error){
//   //     console.log("getConnection Error" + error);
//   //     connection.release();
//   //     res.sendStatus(500);
//   //   }
//   //   else{
//   //     //  sql = '';
//   //     connection.release();
//   //     console.log(req.body);
//   //     res.send({result : 'ok'});
//   //
//   //     // connection.query(sql,[], function(error, rows){
//   //     //   if (error){
//   //     //     console.log("Connection Error" + error);
//   //     //     res.sendStatus(500);
//   //     //     connection.release();
//   //     //   }
//   //     //   else {
//   //     //     // res.status(201).send({result : 'create'});
//   //     //     connection.release();
//   //     //     console.log(rows);
//   //     //     res.render('basketRank',
//   //     //       {
//   //     //         title : '바스켓 랭킹 설정 페이지',
//   //     //         baskets : rows
//   //     //       }
//   //     //     );
//   //     //   }
//   //     // });
//   //   }
//
//   // });
//
// });

module.exports = router;

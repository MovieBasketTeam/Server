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

// router.get('/', function(req, res, next) {
//   pool.getConnection(function(error, connection){
//     if (error){
//       console.log("getConnection Error" + error);
//       connection.release();
//       res.sendStatus(500);
//     }
//     else{
//         sql = 'select small_category from category order by big_category';
//         sql2 = 'select basket_name from basket';
//       connection.query(sql, function(error, rows){
//         if (error){
//           console.log("Connection Error" + error);
//           connection.release();
//           res.sendStatus(500);
//         }
//         else {
//           // res.status(201).send({result : 'create'});
//           //connection.release();
//           console.log(rows);
//           res.render('category',
//             {
//               title : '바스켓 카테고리 설정 페이지',
//               categorys : rows
//             }
//           );
//         }
//       });
//       connection.query(sql2, function(error, rows){
//         if(error) {
//           console.log("Connection Error" + error);
//           connection.release();
//           res.sendStatus(500);
//         }
//         else{
//           connection.release();
//           console.log(rows);
//           res.render('category',
//         {
//           baskets : rows
//         }
//       );
//         }
//       });
//     }
//   });
// });

module.exports = router;

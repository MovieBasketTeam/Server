var express = require('express');
var mysql = require('mysql');
var db_config = require('../config/db_config.json');
var awsinfo_config = require('../config/awsinfo_config.json');
var router = express.Router();

var fs = require('fs');
var multer = require('multer');

var _storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './uploads/images/');
  },
  filename: function(req, file, cb){
    cb(null, Date.now() + "." + file.originalname.split('.').pop());
  }
});
var upload = multer({
  storage: _storage
});

var pool = mysql.createPool({
  host : db_config.host,
  port : db_config.port,
  user : db_config.user,
  password : db_config.password,
  database : db_config.database,
  connectionLimit : db_config.connectionLimit
});

router.get('/', function(req, res, next) {
    res.render('uploadBasket', { title : '바스켓 추가 페이지'});
});

router.post('/', upload.single('basket_image'), function(req, res, next) {
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      var sql, inserts;
      var date = new Date();
      if (req.file){
        sql = 'insert into basket(basket_name, basket_image, basket_date) values(?,?,?)';
        var url = awsinfo_config.url+'/images/'+req.file.filename;
        inserts = [req.body.basket_name, url, date];
        console.log(req.file);
      }
      connection.query(sql, inserts, function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
          connection.release();
        }
        else {
          res.status(201).send({result : 'create'});
          connection.release();
        }
      });
    }
  });
});

module.exports = router;

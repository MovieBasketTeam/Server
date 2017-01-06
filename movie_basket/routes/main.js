var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var db_config = require('../config/db_config.json');
var awsinfo_config = require('../config/awsinfo_config.json');
var url = awsinfo_config.url;

var pool = mysql.createPool({
  host : db_config.host,
  port : db_config.port,
  user : db_config.user,
  password : db_config.password,
  database : db_config.database,
  connectionLimit : db_config.connectionLimit
});

router.get('/', function (req, res, next) {
    pool.getConnection(function(error, connection){
        if (error){
          console.log("getConnection Error" + error);
          connection.release();
          res.sendStatus(500);
        }
        else{
            console.log("세션" + req.session);
            if(req.session == null){
                res.redirect('login');
            }
            else{
                res.render('main', { urls : url });
            }
            connection.release();
            // if(req.session.member_id == null){
            //     res.redirect('login');
            // }
            // else{
            //     res.render('main',
            //   {
            //     urls : url
            //   });
            // }
    }
    });
});
module.exports = router;

var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var db_config = require('../config/db_config.json');
var awsinfo_config = require('../config/awsinfo_config.json');
var url = awsinfo_config.url;
var Member = require('../models/login');
router.get('/', function (req, res, next) {
    res.render('login', { urls : url });
});

// 로그인 '/' post 방식 요청 처리
router.post('/', function (req, res, next) {
    var logInInfo = {
        member_email : req.body.id,
        member_pwd : req.body.pwd
    };
    Member.logIn(logInInfo, function (error, results) {
        if (error) {
            console.log("Connection error " + error);
            return res.send(error);
        }
        else if (results.message == 'check information') {
            res.status(201).render('login', {urls :url});
        }
        else {
            if (results.member_info) {
                var sess = req.session;
                console.log(req.session);
                sess.member_id = results.member_info.member_email;
                var result_value = {message : results.message};
                res.status(201).render('main', {urls : url});
            }
        }


    });
});
module.exports = router;

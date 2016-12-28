var express = require('express');
var Member = require('../models/member');
var router = express.Router();


router.get('/', function (req, res) {
    console.log(req.session.member_name);
    res.send({result : 'check'});
});

// 로그인 '/' post 방식 요청 처리
router.post('/', function (req, res, next) {
    var logInInfo = {
        member_email : req.body.member_email,
        member_pwd : req.body.member_pwd
    }

    Member.logIn(logInInfo, function (error, results) {
        if (error) {
            console.log("Connection error " + error);
            return res.send(error);
        }
        else {
            if (results.member_info) {
                var sess = req.session;
                sess.member_id = results.member_info.member_id;
                sess.member_name = results.member_info.member_name;
                console.log("session made " +req.session);
            }
    //        res.status(201).send({result : results.message});
        }
        console.log("results message : "+results.message);
        res.status(201).send({result : results.message});
        console.log("results message : "+results.message);
    });
});

// 회원가입으로 '/signUp' 경로로 post 방식 요청 처리
router.post('/signUp', function (req, res, next) {
    var signUpInfo = {
        member_name : req.body.member_name,
        member_email : req.body.member_email,
        member_pwd : req.body.member_pwd
    };

    Member.signUp(signUpInfo, function (error, results) {
        if (error) {
            console.log("Connection error " + error);
            res.send(error);
        }
        else {
            res.status(201).send({result : results});
        }
    });
});

module.exports = router;

var express = require('express');
var Member = require('../models/member');
var multerUpload = require('../models/multer').upload;
var router = express.Router();


router.get('/', function (req, res) {
    console.log(req.session);
    res.send({result : 'check'});
});

// 1-a 로그인 '/' post 방식 요청 처리
router.post('/', function (req, res, next) {

    var logInInfo = {
        member_email : req.body.member_email,
        member_pwd : req.body.member_pwd
    };

    Member.logIn(logInInfo, function (error, results) {
        if (error) {
            return res.send(error);
        }
        res.status(201).send({result : results});

    });
});

// 1-b 회원가입 - 회원가입으로 '/signUp' 경로로 post 방식 요청 처리
router.post('/signUp', function (req, res, next) {
    var signUpInfo = {
        member_name : req.body.member_name,
        member_email : req.body.member_email,
        member_pwd : req.body.member_pwd
    };

    Member.signUp(signUpInfo, function (error, results) {
        if (error) {
            console.log("1-b signUp error : " + error);
            res.status(500).send({result : error});
        }
        else {
            res.status(201).send({result : results});
        }
    });
});

// 1-c 회원탈퇴 - avialable 을 1 -> 0으로 변경 처리
router.get('/withdraw', function(req,res,next) {

    var withdrawInfo = {
      member_token : req.headers.member_token
    };

    Member.withdraw(withdrawInfo, function (error, results) {
      if (error) {
          console.log("1-c withdraw error : " + error);
          return res.status(500).send({result : error});
      }
      else {
          res.status(201).send({result : results});
      }
    });
});

// 1-d 버전 확인 version이 0.1인지 확인
router.get('/version', function (req, res, next) {
    Member.checkVersion(function (error, results) {
        if (error) {
          console.log("1-d version check error : " + error);
          return res.status(500).send({result : error});
        }
        else {
            res.status(200).send({result : results});
        }
    });
});

// 1-e 로그인 상태 확인 token을 보내서 로그인 여부를 확인한다.
router.get('/verify', function (req, res, next) {
    var verifyInfo =
    {
        member_token : req.headers.member_token
    }
    Member.verify(verifyInfo, function (error, results) {
        if (error) {
            console.log("Connection error " + error);
            return res.send(error);
        }
        else {
            res.status(201).send({result : results});
        }
    });
});

// 1-f 프로필 사진 업데이트
router.post('/uploadprofile', multerUpload.single('profile_file'), function (req, res, next) {
    var info = {
        member_token : req.headers.member_token,
        file : req.file
    };

    Member.uploadProfile(info, function (error, results) {
        if (error) {
            console.log(error);
            return res.status(500).send({result : error});
        }
        else {
            res.status(201).send({result : results});
        }
    });
});

// 1-g 프로필 사진 삭제
router.delete('/deleteprofile', function (req, res, next) {
    var info = {
        member_token : req.headers.member_token
    };

    Member.deleteProfile(info, function (error, results) {
        if (error) {
            console.log("1-g connection error");
            return res.status(500).send({result : error});
        }
        else {
            res.status(201).send({result : results});
        }
    });
});

module.exports = router;

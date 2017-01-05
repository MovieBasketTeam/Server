var express = require('express');
var Mypage = require('../models/mypage');
var logger = require('../models/winston');
var router = express.Router();

// 4-a.마이페이지 메인
// 마이페이지 기본 화면을 띄워준다.
router.get('/', function(req, res, next) {
    var mypageInfo =
    {
          member_token : req.headers.member_token
    };

    Mypage.basicMypage(mypageInfo, function(error, results){
      if (error) {
          logger.debug("4-a error");
          res.status(500).send({result : error});
      }
      else{
        res.status(201).send({result : results});
      }
    });
});

// 4-b. 담은 바스켓 조회
router.get('/basket', function(req, res, next) {
    var mypageInfo =
    {
          member_token : req.headers.member_token
    };

    Mypage.showMyBasket(mypageInfo, function(error, results) {
        if(error) {
            logger.debug("4-b error");
            res.status(500).send({result : error});
        }
        else {
            res.status(201).send({result : results});
        }
    });
});

// 4-c.담은 영화
router.get('/movie/cart', function(req, res, next) {
    var mypageInfo = {
        member_token : req.headers.member_token
    }

    Mypage.showCartedMovie(mypageInfo, function(error, results) {
        if(error) {
            logger.debug("4-c error");
            res.status(500).send({result : error});
        }
        else {
            res.status(201).send({result : results});
        }
    });
});

// 4-d. 추천한 영화
router.get('/movie/recommend', function(req, res, next) {
    var mypageInfo = {
          member_token : req.headers.member_token
    }

    Mypage.showRecommendedMovie(mypageInfo, function(error, results) {
        if(error) {
            logger.debug("4-d error");
            res.status(500).send({result : error});
        }
        else {
            res.status(201).send({result : results});
        }
    });
});

// 4-e. 마이페이지 환경설정
router.get('/setting', function (req, res, next) {
    var settingInfo =
    {
      member_token : req.headers.member_token
    }

    Mypage.settingMypage(settingInfo, function(error, results){
        if (error) {
            logger.debug("4-e error");
            res.status(500).send({result : error});
        }
        else{
            res.status(201).send({result : results});
        }
    });
});


//4-f 담은영화 빼기
router.post('/movie/cart/delete', function(req,res,next){

    var movieDeleteInfo = {
        movie_id : req.body.movie_id,
        member_token : req.headers.member_token
    }

    Mypage.deleteMyMovie(movieDeleteInfo, function(error, results){

      if (error) {
            logger.debug("4-f error");
            res.status(500).send({result : error});
      }
      else {
           res.status(201).send({result : results});
      }
    });

});


//4-g 담은 바스켓 빼기
router.post('/basket/delete', function (req, res, next) {
    var basketInfo = {
        basket_id : req.body.basket_id,
        member_token : req.headers.member_token
    }

    Mypage.deleteBasket(basketInfo, function (error, results) {
        if (error) {
            logger.debug("4-f error");
            res.status(500).send({result : error});
        }
        else {
            res.status(201).send({result : results});
        }
    });
});

module.exports = router;

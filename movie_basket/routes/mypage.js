var express = require('express');
var Mypage = require('../models/mypage');
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
          console.log("Connection error " + error);
      }
      else{
        console.log("in here");
        res.status(201).send({result : results});
      }
    });
  /*
  Mypage.showMypages(mypageInfo, function (error, results) {
    if(error) {
      console.log("Connection error " + error);
      res.send(error);
    }
    else {
      res.status(201).send({result : results});
    }
  });
  */
});

// 4-b. 담은 바스켓 조회
router.get('/basket', function(req, res, next) {
    var mypageInfo =
    {
          member_token : req.headers.member_token
    };

    Mypage.movieBasket(mypageInfo, function(error, results) {
        if(error) {
            console.log("Connection error " + error);
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

  Mypage.movieCart(mypageInfo, function(error, results) {
    if(error) {
      console.log("Connection error " + error);
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

    Mypage.movieRecommend(mypageInfo, function(error, results) {
        if(error) {
            console.log("Connection error " + error);
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
          console.log("Connection error " + error);
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

    Mypage.movieDelete(movieDeleteInfo, function(error, results){
        if(error){
            console.log("Connection error " + error);
            res.send(error);
        }
        else {
            res.status(201).send({result : results});
        }
    });
});

router.post('/basket/delete', function (req, res, next) {
    var basketInfo = {
        basket_id : req.body.basket_id,
        member_token : req.headers.member_token
    }

    Mypage.deleteBasket(basketInfo, function (error, results) {
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

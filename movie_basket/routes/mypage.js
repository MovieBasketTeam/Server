var express = require('express');
var Mypage = require('../models/mypage');
var router = express.Router();

// 4-a.마이페이지 메인
// 마이페이지 기본 화면을 띄워준다.
router.get('/', function(req, res, next) {
  var mypageInfo = {
    member_name : req.session.member_name
  }

  Mypage.showMypages(basketInfo, function (error, results) {
    if(error) {
      console.log("Connection error " + error);
    }
    else {
      res.status(201).send({result : results});
    }
  });
});

// 4-b. 담은 바스켓 조회
router.get('/basket', function(req, res, next) {
  var mypageInfo = {
    baskets : [
      {
        basket_id : req.body.basket_id,
        basket_name : req.body.basket_name,
        basket_image : req.body.basket_image,
        basket_like : req.body.basket_like
      }
    ]
  }

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
    movies : [
      {
        movie_id : req.body.movie_id,
        movie_title : req.body.movie_title,
        movie_image : req.body.movie_image,
        movie_director : req.body.movie_director,
        movie_pub_date : req.body.movie_pub_date,
        movie_user_rating : req.body.movie_user_rating,
        movie_link : req.body.movie_link,
        movie_like : req.body.movie_like,
        is_liked : req.body.is_liked
      }
    ]
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
    movies : [
      {
        movie_id : req.body.movie_id,
        movie_title : req.body.movie_title,
        movie_image : req.body.movie_image,
        movie_director : req.body.movie_director,
        movie_pub_date : req.body.movie_pub_date,
        movie_user_rating : req.body.movie_user_rating,
        movie_link : req.body.movie_link,
        movie_like : req.body.movie_like,
        is_liked : req.body.is_liked
      }
    ]
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

module.exports = router;

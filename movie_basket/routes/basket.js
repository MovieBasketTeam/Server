var express = require('express');
var Basket = require('../models/basket');
var router = express.Router();

// basket 목록을 보여주는 get 요청 처리
// query params에 sort 정보를 전달해준다.
router.get('/:sort', function (req, res, next) {
    var basketInfo = {
        sort : req.params.sort,
        u_id : req.session.member_id
    }

    Basket.showBaksets(basketInfo, function (error, results) {
        if (error) {
            console.log("Connection error " + error);
        }
        else {
            res.status(201).send({result : results});
        }
    });
});

// 바스켓 /like 경로로 바스켓 담기 post 방식 요청 처리, 바스켓 추천과 담기
router.post('/like', function(req,res,next) {
      var basketLikeInfo = {
          member_id : req.session.member_id,
          basket_id : req.body.basket_id,
          is_liked : req.body.is_liked
      }
      Basket.likeBasket(basketLikeInfo, function(error, results){
          if (error) {
              console.log("Connection error " + error);
              res.send(error);
          }
          else {
              res.status(201).send({result : results});
          }
      });
  });


// 영화 추천 /movie/recommend 경로로 영화추천 post방식 요청 처리
router.post('/movie/recommend', function(req,res,next){
  var movieRecommendInfo = {
      movie_id : req.body.movie_id
  }
  Basket.movieRecommend(movieRecommendInfo, function(error, results){
    if(error){
      console.log("Connection error " + error);
      res.send(error);
    }
    else {
      res.status(201).send({result : results});
    }
  });
});

// 영화 담기 /movie/cart경로로 영화담기 post방식 요청 처리
router.post('/movie/cart', function(req,res,next){
  var movieCartInfo = {
      movie_id : req.body.movie_id
  }
  Basket.movieCart(movieCartInfo, function(error, results){
    if(error){
      console.log("Connection error " + error);
      res.send(error);
    }
    else {
      res.status(201).send({result : results});
    }
  });
});


// 영화 추가 /movie/add 경로로 영화담기 post방식 요청 처리
router.post('/movie/add', function(req,res,next){
  var movieAddInfo = {
      basket_id : req.body.basket_id,
      movie_url : req.body.movie_url
  }
  Basket.movieAdd(movieAddInfo, function(error, results){
    if(error){
      console.log("Connection error " + error);
      res.send(error);
    }
    else {
      res.status(201).send({result : results});
    }
  });
});

module.exports = router;

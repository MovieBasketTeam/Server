var express = require('express');
var Basket = require('../models/basket');
var router = express.Router();

// basket 목록을 보여주는 get 요청 처리
// query params에 sort 정보를 전달해준다.

// 2-a 바스켓 보여주기  지정한 정렬방식으로 바스켓 목록을 보여준다
router.get('/', function (req, res, next) {
    var basketInfo = {
        sort : req.query.sort,
        member_token : req.headers.member_token
    }

    Basket.showBaksets(basketInfo, function (error, results) {
        if (error) {
          console.log("2-a show basket error : " + error);
          return res.status(500).send({result : error});
        }
        else {
            res.status(201).send({result : results});
        }
    });
});

// 바스켓 /like 경로로 바스켓 담기 post 방식 요청 처리, 바스켓 추천과 담기
// 2-b 바스켓 담기 선택한 바스켓을 담는다
router.post('/like', function (req, res, next) {
    var basketLikeInfo =
    {
        member_token : req.headers.member_token,
        basket_id : req.body.basket_id
    }
    Basket.likeBasket(basketLikeInfo, function (error, results) {
        if (error) {
            console.log("2-b basket like error");
            res.status(500).send({result : error});
        }
        else {
            res.status(201).send({result : results});
        }
    });
});

// 바스켓 내부 영화 상세 목록 조회 get 방식 요청 처리
// 2-c 바스켓 상세보기
router.get('/detail/:basket_id', function (req, res, next) {
    var basketDetailInfo =
    {
        member_token : req.headers.member_token,
        basket_id : req.params.basket_id
    }

    Basket.showBasketDetail(basketDetailInfo, function (error, results) {
        if (error) {
          console.log("2-c basket detail error");
          res.status(500).send({result : error});
        }
        else {
            res.status(200).send({result : results});
        }
    });
});


// 영화 추천 /movie/recommend 경로로 영화추천 post방식 요청 처리
router.post('/movie/recommend', function(req,res,next){
    var movieRecommendInfo = {
        is_liked : req.body.is_liked,
        movie_id : req.body.movie_id,
        member_token : req.headers.member_token
    }
    Basket.movieRecommend(movieRecommendInfo, function(error, results){
        if(error){
            console.log("Connection error " + error);
            res.send(error);
        }
        else {
          //console.log(movieRecommendInfo.is_liked + "fuck!!!!!!!!");
            res.status(201).send({result : results});
        }
    });
});


// 영화 담기 /movie/cart경로로 영화담기 post방식 요청 처리
router.post('/movie/cart', function(req,res,next){

    var movieCartInfo = {
        is_carted : req.body.is_carted,
        movie_id : req.body.movie_id,
        member_token : req.headers.member_token
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
        movie_title : req.body.movie_title,
        movie_image : req.body.movie_image,
        movie_pub_date : req.body.movie_pub_date,
        movie_director : req.body.movie_director,
        movie_user_rating : req.body.movie_user_rating,
        movie_link : req.body.movie_link,
        member_token : req.headers.member_token
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

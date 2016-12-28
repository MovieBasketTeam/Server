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
router.post('/like', function (req, res, next) {
    var basketLikeInfo =
    {
        member_id : req.session.member_id,
        basket_id : req.body.basket_id,
        is_liked : req.body.is_liked
    }
    Basket.likeBasket(basketLikeInfo, function (error, results) {
        if (error) {
            console.log("Connection error " + error);
            res.send(error);
        }
        else {
            res.status(201).send({result : results});
        }
    });
});

// 바스켓 내부 영화 상세 목록 조회 get 방식 요청 처리
router.get('/detail/:basket_id', function (req, res, next) {
    var basketDetailInfo =
    {
        member_id : req.session.member_id,
        basket_id : req.params.basket_id
    }

    Basket.showBasketDetail(basketDetailInfo, function (error, results) {
        if (error) {
            console.log("Connection error " + error);
            res.send(error);
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
        member_id : req.session.member_id
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
        is_carted : req.body.is_carted,
        movie_id : req.body.movie_id,
        member_id : req.session.member_id
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
        movie_adder : req.session.member_name,
        member_id : req.session.member_id
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

var dbPool = require('./common').dbPool;
var async = require('async');

// 홈 화면에서 바스켓 조회
function showBaksets (basketInfo, callback) {
    // sort 방식에 따른 다른 쿼리문
    var sql_basket_shows = [
        'SELECT basket_id, basket_name, basket_image, basket_like, (CASE WHEN u_id IS NULL THEN 0 ELSE 1 END) AS is_liked '+
        'FROM basket b '+
        'LEFT JOIN (SELECT b_id, u_id FROM basket_heart WHERE u_id = ?) bh ON(b.basket_id = bh.b_id) '+
        'ORDER BY b.basket_rank DESC',
        'SELECT basket_id, basket_name, basket_image, basket_like, (CASE WHEN u_id IS NULL THEN 0 ELSE 1 END) AS is_liked '+
        'FROM basket b '+
        'LEFT JOIN (SELECT b_id, u_id FROM basket_heart WHERE u_id = ?) bh ON(b.basket_id = bh.b_id) '+
        'ORDER BY b.basket_date DESC',
        'SELECT basket_id, basket_name, basket_image, basket_like, (CASE WHEN u_id IS NULL THEN 0 ELSE 1 END) AS is_liked '+
        'FROM basket b '+
        'LEFT JOIN (SELECT b_id, u_id FROM basket_heart WHERE u_id = ?) bh ON(b.basket_id = bh.b_id) '+
        'ORDER BY b.basket_like DESC'
    ];

    var current_sql = sql_basket_shows[basketInfo.sort - 1];
    dbPool.getConnection ( function (error, dbConn) {
        if (error) {
            return callback(error);
        }
        var showMessage = {};
        dbConn.query(current_sql, [basketInfo.u_id], function (error, rows) {
            if (error) {
                dbConn.release();
                return callback(error);
            }
            else {
                dbConn.release();
                showMessage = { baskets : rows}
                return callback(null, showMessage);
            }
        });
    });
}

// 바스켓 추천, 담기 처리 함수 // is_liked = 0 -> 1 , is_liked = 1 -> 0
// async 사용, 로그인 세션 이용
function likeBasket(basketLikeInfo, callback) {

    // 마이 바스켓 목록 업데이트
    var sql_update_my_basket =
    [
        'insert into basket_heart(b_id, u_id) values (?, ?)',
        'delete from basket_heart where b_id = ? and u_id = ?'
    ];

    // 바스켓 추천 수 업데이트
    var sql_update_basket_like =
    [
        'update basket set basket_like = basket_like + 1 where basket_id = ?',
        'update basket set basket_like = basket_like - 1 where basket_id = ?'
    ]

    dbPool.getConnection(function(error,dbConn) {
        if(error){
            return callback(error);
        }
        var basketLikeMessage = {};
        async.series([updateMyBasket, updateBasketLike], function (error, results) {
            if (error) {
                dbConn.release();
                return callback(error);
            }
            dbConn.release();
            basketLikeMessage = {message : "like update success"};
            return callback(null, basketLikeMessage);
        });

        // 자신의 바스켓 목록 업데이트 함수
        function updateMyBasket (done) {
            dbConn.query(sql_update_my_basket[basketLikeInfo.is_liked], [basketLikeInfo.basket_id, basketLikeInfo.member_id], function (error, rows) {
                if (error) {
                    return done(error);
                }
                else {
                    return done(null);
                }
            });
        }
        // 바스켓 좋아요 수 업데이트 함수
        function updateBasketLike (done) {
            dbConn.query(sql_update_basket_like[basketLikeInfo.is_liked], [basketLikeInfo.basket_id], function (error, rows) {
                if (error) {
                    return done(error);
                }
                else {
                    return done(null);
                }
            });
        }
    });
}

// basket 내부의 영화 목록을 보여주는 함수
// basket_id 에 따라 부르고 좋아요 여부를 확인하기 위해 member_id에 따라 left join을 한다.
function showBasketDetail (basketDetailInfo, callback) {
    var sql_basket_detail =
        'SELECT movie_id, movie_title, movie_image, movie_pub_date, movie_director, movie_user_rating, movie_link, movie_adder, movie_like,'+
        '(CASE WHEN u_id IS NULL THEN 0 ELSE 1 END) AS is_liked '+
        'FROM movie AS m '+
        'LEFT JOIN (SELECT m_id, u_id FROM movie_heart WHERE u_id = ?) AS mh ON(m.movie_id = mh.m_id) '+
        'WHERE basket_id = ? '
        'ORDER BY m.movie_like DESC';

    dbPool.getConnection ( function (error, dbConn) {
        if (error) {
            return callback(error);
        }
        var basketDetailMessage = {};
        dbConn.query(sql_basket_detail, [basketDetailInfo.member_id, basketDetailInfo.basket_id], function (error, rows) {
            if (error) {
                dbConn.release();
                return callback(error);
            }
            else {
                dbConn.release();
                basketDetailMessage = { movies : rows}
                return callback(null, basketDetailMessage);
            }
        });
    });
}
// 영화 추천 처리 함수
function movieRecommend (movieRecommendInfo, callback) {
    var sql_movie_recommend = '';
    dbPool.getConnection (function (error,dbConn) {
    if (error) {
        return callback(error);
    }

    dbConn.query();
});
}

// 영화 담기 처리 함수
function movieCart(movieCartInfo, callback){
  var sql_movie_cart = '';
  dbPool.getConnection(function(error,dbConn){
    if(error){
      return callback(error);
    }
    dbConn.query();
  });
}

function movieAdd(movieAddInfo, callback){
  var sql_movie_add = '';
  dbPool.getConnection(function(error,dbConn){
    if(error){
      return callback(error);
    }
    dbConn.query();
  });
}

module.exports.showBaksets = showBaksets;
module.exports.likeBasket = likeBasket;
module.exports.showBasketDetail = showBasketDetail;
module.exports.movieRecommend = movieRecommend;
module.exports.movieCart = movieCart;
module.exports.movieAdd = movieAdd;

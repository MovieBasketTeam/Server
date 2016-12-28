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

// 바스켓 추천, 담기 처리 함수
function like(basketLikeInfo, callback){
  var sql_basket_like = '';
  dbPool.getConnection(function(error,dbConn){
    if(error){
      return callback(error);
    }
    dbConn.query();
  });
}
// 영화 추천 처리 함수
function movieRecommend(movieRecommendInfo, callback){
  var sql_movie_recommend = '';
  dbPool.getConnection(function(error,dbConn){
    if(error){
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
module.exports.like = like;
module.exports.movieRecommend = movieRecommend;
module.exports.movieCart = movieCart;
module.exports.movieAdd = movieAdd;

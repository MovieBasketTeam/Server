var dbPool = require('./common').dbPool;
var async = require('async');

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

module.exports.like = like;
module.exports.movieRecommend = movieRecommend;
module.exports.movieCart = movieCart;
module.exports.movieAdd = movieAdd;

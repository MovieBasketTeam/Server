var dbPool = require('./common').dbPool;
var async = require('async');
/*
function showMypages(mypageInfo, callback) {
  var sql_mypage_shows =
    'SELECT member_name, member_image from member where member_name = ?';
  dbPool.getConnection (function(error, dbConn) {
    if(error) {
      return callback(error);
    }
    var showMessage = {};
    dbConn.query(sql_mypage_shows, [mypageInfo.member_name], function(error, rows) {
      if(error) {
        dbConn.release();
        return callback(error);
      }
      else {
        dbConn.release();
        showMessage = { result : rows }
        return callback(null, showMessage);
      }
    });
  });
}
*/

function movieBasket(mypageInfo, callback) {
  var sql_movieBasket =
  'SELECT b.basket_id, b.basket_name, b.basket_image, b.basket_like ' +
  'FROM basket b JOIN basket_heart bh ON (b.basket_id = bh.b_id) ' +
                'JOIN member m ON (bh.u_id = m.member_id) ' +
  'WHERE m.member_id = ? ';
  dbPool.getConnection (function(error, dbConn) {
    if(error) {
      return callback(error);
    }
    var showMessage = {};
    dbConn.query(sql_movieBasket, [mypageInfo.member_id], function(error, rows) {
      if(error) {
        dbConn.release();
        return callback(error);
      }
      else {
        dbConn.release();
        showMessage = { result : rows }
        return callback(null, showMessage);
      }
    });
  });
}

function movieCart(mypageInfo, callback) {
  var sql_movieCart =
  'SELECT movie_id, movie_title, movie_image, movie_director, movie_pub_date, ' +
  'movie_user_rating, movie_link, movie_like, (CASE WHEN u_id IS NULL THEN 0 ELSE 1 END) AS is_liked ' +
  'FROM movie m JOIN movie_clip mc ON (m.movie_id = mc.m_id) ' +
               'JOIN member mem ON (mc.u_id = mem.member_id) ' +
  'WHERE mem.member_id = ?';
  dbPool.getConnection(function(error, dbConn) {
    if(error) {
      return callback(error);
    }
    var showMessage = {};
    dbConn.query(sql_movieCart, [mypageInfo.member_id], function(error, rows) {
      if(error) {
        dbConn.release();
        return callback(error);
      }
      else {
        dbConn.release();
        showMessage = { result : rows }
        return callback(null, showMessage);
      }
    });
  });
}

function movieRecommend(mypageInfo, callback) {
  var sql_movieReccomend =
  'SELECT m.movie_id, m.movie_title, m.movie_image, m.movie_director, m.movie_pub_date, ' +
  'm.movie_user_rating, m.movie_link, m.movie_like, (CASE WHEN u_id IS NULL THEN 0 ELSE 1 END) AS is_liked ' +
  'FROM movie m JOIN movie_heart mh ON (m.movie_id = mh.m_id) ' +
			         'JOIN member mem ON (mh.u_id = mem.member_id) ' +
  'WHERE mem.member_id = ?';
  dbPool.getConnection(function(error, dbConn) {
    if(error) {
      return callback(error);
    }
    var showMessage = {};
    dbConn.query(sql_movieReccomend, [mypageInfo.member_id], function(error, rows) {
      if(error) {
        dbConn.release();
        return callback(error);
      }
      else {
        dbConn.release();
        showMessage = { result : rows }
        return callback(null, showMessage);
      }
    });
  });
}

module.exports.movieBasket = movieBasket;
module.exports.movieCart = movieCart;
module.exports.movieRecommend = movieRecommend;

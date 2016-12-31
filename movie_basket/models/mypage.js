var dbPool = require('./common').dbPool;
var async = require('async');
var jwt = require('./jwt');

function basicMypage (mypageInfo, callback) {
  var showMessage = {};

  if (mypageInfo.member_token =='') {
    showMessage = {message : "is not logined"};
    return callback(null, showMessage);
  }

  showMessage = {
    member_name : jwt.decodeToken(mypageInfo.member_token).member_name
  }
  return callback(null, showMessage);

}

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
        if (mypageInfo.member_token == '') {
            dbConn.release();
            showMessage = {message : "is not logined"};
            return callback(null, showMessage);
        }

        dbConn.beginTransaction (function (error) {
            if (error) {
                dbConn.release();
                return callback(error);
            }
            dbConn.query(sql_movieBasket, [jwt.decodeToken(mypageInfo.member_token).member_id], function(error, rows) {
                if (error) {
                    return dbConn.rollback(function () {
                        dbConn.release();
                        callback(error);
                    });
                }
                dbConn.commit(function () {
                    dbConn.release();
                    showMessage = { result : rows }
                    return callback(null, showMessage);
                });
            });
        });
    });
}

function movieCart(mypageInfo, callback) {

    var sql_movieCart =
    'SELECT m.movie_id, m.movie_title, m.movie_image, m.movie_director, m.movie_pub_date, m.movie_adder, '+
    'm.movie_user_rating, m.movie_link, m.movie_like, (CASE WHEN mh.u_id IS NULL THEN 0 ELSE 1 END) AS is_liked, '+
    '(CASE WHEN mc.u_id IS NULL THEN 0 ELSE 1 END) AS is_cart , bn.basket_name'+
    'FROM movie m JOIN (SELECT m_id, u_id FROM movie_clip WHERE u_id = ?) mc ON(m.movie_id = mc.m_id) '+
    'LEFT JOIN (SELECT m_id, u_id FROM movie_heart WHERE u_id = ?) mh ON(m.movie_id = mh.m_id) '+
    'JOIN (SELECT basket_name, basket_id FROM basket) AS bn ON(m.basket_id = bn.basket_id)';

  dbPool.getConnection(function(error, dbConn) {
    if(error) {
      return callback(error);
    }
    var showMessage = {};
    if (mypageInfo.member_token == '') {
        dbConn.release();
        showMessage = {message : "is not logined"};
        return callback(null, showMessage);
    }
    dbConn.beginTransaction (function (error) {
        if (error) {
            dbConn.release();
            return callback(error);
        }
        var member_id = jwt.decodeToken(mypageInfo.member_token).member_id;
    dbConn.query(sql_movieCart, [member_id, member_id], function(error, rows) {
      if (error) {
        return dbConn.rollback(function () {
            dbConn.release();
            showMessage = {message : "is not logined"};
            return callback(null, showMessage);
        }
        dbConn.beginTransaction (function (error) {
            if (error) {
                dbConn.release();
                return callback(error);
            }
            dbConn.query(sql_movieCart, [jwt.decodeToken(mypageInfo.member_token).member_id], function(error, rows) {
                if (error) {
                    return dbConn.rollback(function () {
                        dbConn.release();
                        callback(error);
                    });
                }
                dbConn.commit(function () {
                    dbConn.release();
                    showMessage = { result : rows }
                    return callback(null, showMessage);
                });
            });
        });
    });
}

function movieRecommend(mypageInfo, callback) {
<<<<<<< HEAD
    var sql_movieReccomend =
    'SELECT m.movie_id, m.movie_title, m.movie_image, m.movie_director, m.movie_pub_date, m.movie_adder, '+
    'm.movie_user_rating, m.movie_link, m.movie_like, (CASE WHEN mh.u_id IS NULL THEN 0 ELSE 1 END) AS is_liked, '+
    '(CASE WHEN mc.u_id IS NULL THEN 0 ELSE 1 END) AS is_cart, bn.basket_name'+
    'FROM movie m JOIN (SELECT m_id, u_id FROM movie_heart WHERE u_id = ?) mh ON(m.movie_id = mh.m_id) '+
    'LEFT JOIN (SELECT m_id, u_id FROM movie_clip WHERE u_id = ?) mc ON(m.movie_id = mc.m_id) '+
    'JOIN (SELECT basket_name, basket_id FROM basket) AS bn ON(m.basket_id = bn.basket_id)';

    dbPool.getConnection(function(error, dbConn) {
        if(error) {
=======
  var sql_movieReccomend =
  'SELECT m.movie_id, m.movie_title, m.movie_image, m.movie_director, m.movie_pub_date, m.movie_adder, '+
  'm.movie_user_rating, m.movie_link, m.movie_like, (CASE WHEN mh.u_id IS NULL THEN 0 ELSE 1 END) AS is_liked, '+
  '(CASE WHEN mc.u_id IS NULL THEN 0 ELSE 1 END) AS is_cart, bn.basket_name'+
  'FROM movie m JOIN (SELECT m_id, u_id FROM movie_heart WHERE u_id = ?) mh ON(m.movie_id = mh.m_id) '+
  'LEFT JOIN (SELECT m_id, u_id FROM movie_clip WHERE u_id = ?) mc ON(m.movie_id = mc.m_id) '+
  'JOIN (SELECT basket_name, basket_id FROM basket) AS bn ON(m.basket_id = bn.basket_id)';

  dbPool.getConnection(function(error, dbConn) {
    if(error) {
      return callback(error);
    }
    var showMessage = {};
    dbConn.beginTransaction (function (error) {
        if (error) {
            dbConn.release();
>>>>>>> refs/remotes/MovieBasketTeam/master
            return callback(error);
        }
        var showMessage = {};
        if (mypageInfo.member_token =='') {
            dbConn.release();
            showMessage = {message : "is not logined"};
            return callback(null, showMessage);
        }
        dbConn.beginTransaction (function (error) {
            if (error) {
                dbConn.release();
                return callback(error);
            }
            var member_id = jwt.decodeToken(mypageInfo.member_token).member_id;
            dbConn.query(sql_movieReccomend, [member_id, member_id], function(error, rows) {
                if (error) {
                    return dbConn.rollback(function () {
                        dbConn.release();
                        callback(error);
                    });
                }
                dbConn.commit(function (){
                    dbConn.release();
                    showMessage = { result : rows }
                    return callback(null, showMessage);
                });
            });
        });
    });
}


//setting
function settingMypage (settingInfo, callback) {

    var showMessage = {};
    if (settingInfo.member_token == '') {
        showMessage = {message : "is not logined"};
        return callback(null, showMessage);
    }

    showMessage = {
        member_name : jwt.decodeToken(settingInfo.member_token).member_name,
        member_email : jwt.decodeToken(settingInfo.member_token).member_email
    }
    return callback(null, showMessage);
}

module.exports.movieBasket = movieBasket;
module.exports.movieCart = movieCart;
module.exports.movieRecommend = movieRecommend;
module.exports.basicMypage = basicMypage;
module.exports.settingMypage = settingMypage;

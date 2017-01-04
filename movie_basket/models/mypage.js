var dbPool = require('./common').dbPool;
var Common = require('./common');
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
    'SELECT b.basket_id, b.basket_name, b.basket_image, b.basket_like, ' +
    '(CASE WHEN u_id IS NULL THEN 0 ELSE 1 END) AS is_liked ' +
    'FROM basket b JOIN basket_heart bh ON (b.basket_id = bh.b_id) ' +
    'JOIN member m ON (bh.u_id = m.member_id) ' +
    'WHERE m.member_id = ? ';
    //is_liked 수정

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
                    showMessage = { baskets : rows }
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
    '(CASE WHEN mc.u_id IS NULL THEN 0 ELSE 1 END) AS is_cart , bn.basket_name '+
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
            console.log(member_id);
            dbConn.query(sql_movieCart, [member_id, member_id], function(error, rows) {
                if (error) {
                    return dbConn.rollback(function () {
                        dbConn.release();
                        return callback(error);
                    });
                }
                dbConn.commit(function () {
                    dbConn.release();
                    showMessage = { result : Common.refineMovieRating(rows) }
                    console.log(Common.refineMovieRating(rows));
                    return callback(null, showMessage);
                });
            });
        });
    });
}

function movieRecommend(mypageInfo, callback) {

    var sql_movieReccomend =
    'SELECT m.movie_id, m.movie_title, m.movie_image, m.movie_director, m.movie_pub_date, m.movie_adder, '+
    'm.movie_user_rating, m.movie_link, m.movie_like, (CASE WHEN mh.u_id IS NULL THEN 0 ELSE 1 END) AS is_liked, '+
    '(CASE WHEN mc.u_id IS NULL THEN 0 ELSE 1 END) AS is_cart, bn.basket_name '+
    'FROM movie m JOIN (SELECT m_id, u_id FROM movie_heart WHERE u_id = ?) mh ON(m.movie_id = mh.m_id) '+
    'LEFT JOIN (SELECT m_id, u_id FROM movie_clip WHERE u_id = ?) mc ON(m.movie_id = mc.m_id) '+
    'JOIN (SELECT basket_name, basket_id FROM basket) AS bn ON(m.basket_id = bn.basket_id)';
    dbPool.getConnection(function(error, dbConn) {
        if(error) {
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
                    showMessage = { result : Common.refineMovieRating(rows) }
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
    var decodedToken = jwt.decodeToken(settingInfo.member_token);
    showMessage = {
        member_name : decodedToken.member_name,
        member_email : decodedToken.member_email,
        member_image : decodedToken.member_image
    }
    return callback(null, showMessage);
}



//movie-delete
function movieDelete(movieDeleteInfo, callback){
    var sql_update_my_movie_delete =
        'delete from movie_clip where m_id = ? and u_id = ?';

    dbPool.getConnection(function (error,dbConn) {
        if(error){
            dbConn.release();
            return callback(error);
        }
        var movieCartMessage = {};
        if (movieDeleteInfo.member_token == '') {
            movieCartMessage = {message : "is not logined"};
            dbConn.release();
            return callback(null, movieCartMessage);
        }

        dbConn.query(
            sql_update_my_movie_delete,
            [movieDeleteInfo.movie_id, jwt.decodeToken(movieDeleteInfo.member_token).member_id],
            function (error, rows) {
                if (error) {
                    dbConn.release();
                    return callback(error);
                }
                else if (rows.affectedRows == 0) {
                  console.log(rows);
                    //return done(new Error("fail delete"));
                    return callback(new Error("fail delete"));
                }
                else {
                    dbConn.release();
                    movieCartMessage = {message : "movie delete success"};
                    return callback(null, movieCartMessage);
                }
            }
        );
    });
}




// 4 -g 담은 바스켓 빼기
function deleteBasket (basketInfo, callback) {
    var sql_update_basket_list =
        'delete from basket_heart where b_id = ? and u_id = ?';
    var sql_update_basket_like =
        'update basket set basket_like = basket_like - 1 where basket_id = ?';

    dbPool.getConnection(function(error, dbConn) {
        if (error) {
            return callback(error);
        }

        var sendMessage = {};
        if (basketInfo.member_token =='') {
            dbConn.release();
            sendMessage = { message : "is not logined"};
            return callback(null, sendMessage);
        }

        dbConn.beginTransaction (function (error) {
            if (error) {
                dbConn.release();
                return callback(error);
            }

            async.series([updateBasketList, updateBasketLike], function (error, results) {
                if (error) {
                    return dbConn.rollback( function () {
                        dbConn.release();
                        callback(error);
                        console.log("dbConnection rollback");
                    });
                }
                dbConn.commit(function () {
                    dbConn.release();
                    sendMessage = {message : "delete success"};
                    callback(null, sendMessage);
                });
            });

            function updateBasketList (done) {
                dbConn.query
                (
                    sql_update_basket_list,
                    [
                        basketInfo.basket_id,
                        jwt.decodeToken(basketInfo.member_token).member_id
                    ],
                    function (error, rows) {
                        if (error) {
                            return done(error);
                        }
                        else if (rows.affectedRows == 0) {
                            console.log("Cannot delete");
                            return done(new Error("delete failed"));
                        }
                        else {
                            console.log("done updateBasketList");
                            return done(null);
                        }
                    }
                );
            }

            function updateBasketLike (done) {
                dbConn.query
                (
                    sql_update_basket_like,
                    [basketInfo.basket_id],
                    function (error, rows) {
                        if (error) {
                            return done(error);
                        }
                        else {
                            console.log("done updateBasketLike");
                            return done(null);
                        }
                    });
            }
        });
    });
}

module.exports.movieBasket = movieBasket;
module.exports.movieCart = movieCart;
module.exports.movieRecommend = movieRecommend;
module.exports.basicMypage = basicMypage;
module.exports.settingMypage = settingMypage;
module.exports.movieDelete = movieDelete;
module.exports.deleteBasket = deleteBasket;

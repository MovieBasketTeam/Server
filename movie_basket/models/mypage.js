var dbPool = require('./common').dbPool;
var Common = require('./common');
var logger = require('./winston').logger;
var async = require('async');
var jwt = require('./jwt');
var server_error = {message : "internal server error"};

function basicMypage (mypageInfo, callback) {
    var showMessage = {};

    if (mypageInfo.member_token =='') {
        logger.debug("In function basicMypage, token is none, member is not logined");
        showMessage = {message : "is not logined"};
        return callback(null, showMessage);
    }

    var decodedToken = jwt.decodeToken(mypageInfo.member_token);
    showMessage = {
        member_name : decodedToken.member_name
    }

    logger.debug("show my page success. member id : "+decodedToken.member_id+" member name : "+decodedToken.member_name);
    return callback(null, showMessage);

}

function showMyBasket(mypageInfo, callback) {

    var sql_movieBasket =
    'SELECT b.basket_id, b.basket_name, b.basket_image, b.basket_like, ' +
    '(CASE WHEN u_id IS NULL THEN 0 ELSE 1 END) AS is_liked ' +
    'FROM basket b JOIN basket_heart bh ON (b.basket_id = bh.b_id) ' +
    'JOIN member m ON (bh.u_id = m.member_id) ' +
    'WHERE m.member_id = ? ';
    //is_liked 수정

    dbPool.getConnection (function(error, dbConn) {

        if(error) {
            logger.debug("In function movieBasket , Get Connection Error");
            return callback(server_error);
        }

        var showMessage = {};
        if (mypageInfo.member_token == '') {
            dbConn.release();
            logger.debug("In function showMyBasket, token is none, member is not logined");
            showMessage = {message : "is not logined"};
            return callback(null, showMessage);
        }

        dbConn.beginTransaction (function (error) {
            if (error) {
                dbConn.release();
                logger.debug("In function showMyBasket , Begin Transaction Error");
                return callback(server_error);
            }
            var decodedToken = jwt.decodeToken(mypageInfo.member_token);
            dbConn.query(sql_movieBasket, [decodedToken.member_id], function(error, rows) {
                if (error) {
                    return dbConn.rollback(function () {
                        logger.debug("In function showMyBasket , query error : "+sql_movieBasket);
                        dbConn.release();
                        callback(server_error);
                    });
                }
                dbConn.commit(function () {
                    dbConn.release();
                    logger.debug("Showing my basket list success. member email : "+decodedToken.member_email);
                    showMessage = { baskets : rows }
                    return callback(null, showMessage);
                });
            });
        });
    });
}

function showCartedMovie(mypageInfo, callback) {

    var sql_movieCart =
    'SELECT m.movie_id, m.movie_title, m.movie_image, m.movie_director, m.movie_pub_date, m.movie_adder, '+
    'm.movie_user_rating, m.movie_link, m.movie_like, (CASE WHEN mh.u_id IS NULL THEN 0 ELSE 1 END) AS is_liked, '+
    '(CASE WHEN mc.u_id IS NULL THEN 0 ELSE 1 END) AS is_cart , bn.basket_name '+
    'FROM movie m JOIN (SELECT m_id, u_id FROM movie_clip WHERE u_id = ?) mc ON(m.movie_id = mc.m_id) '+
    'LEFT JOIN (SELECT m_id, u_id FROM movie_heart WHERE u_id = ?) mh ON(m.movie_id = mh.m_id) '+
    'JOIN (SELECT basket_name, basket_id FROM basket) AS bn ON(m.basket_id = bn.basket_id)';
    dbPool.getConnection(function(error, dbConn) {
        if(error) {
            logger.debug("In function showCartedMovie, Get Connection Error");
            return callback(error);
        }
        var showMessage = {};
        if (mypageInfo.member_token == '') {
            dbConn.release();
            logger.debug("In function showCartedMovie, token is none, member is not logined");
            showMessage = {message : "is not logined"};
            return callback(null, showMessage);
        }
        dbConn.beginTransaction (function (error) {
            if (error) {
                dbConn.release();
                logger.debug("In function showCartedMovie, Begin Transaction Error");
                return callback(error);
            }
            var decodedToken = jwt.decodeToken(mypageInfo.member_token);
            var member_id = decodedToken.member_id;
            dbConn.query(sql_movieCart, [member_id, member_id], function(error, rows) {
                if (error) {
                    return dbConn.rollback(function () {
                        logger.debug("In function showCartedMovie, query error : "+sql_movieCart);
                        dbConn.release();
                        return callback(error);
                    });
                }
                dbConn.commit(function () {
                    dbConn.release();
                    showMessage = { result : Common.refineMovieRating(rows) }
                    logger.debug("Showing carted movie list success. member id : "+decodedToken.member_id);
                    return callback(null, showMessage);
                });
            });
        });
    });
}

function showRecommendedMovie(mypageInfo, callback) {

    var sql_movieReccomend =
    'SELECT m.movie_id, m.movie_title, m.movie_image, m.movie_director, m.movie_pub_date, m.movie_adder, '+
    'm.movie_user_rating, m.movie_link, m.movie_like, (CASE WHEN mh.u_id IS NULL THEN 0 ELSE 1 END) AS is_liked, '+
    '(CASE WHEN mc.u_id IS NULL THEN 0 ELSE 1 END) AS is_cart, bn.basket_name '+
    'FROM movie m JOIN (SELECT m_id, u_id FROM movie_heart WHERE u_id = ?) mh ON(m.movie_id = mh.m_id) '+
    'LEFT JOIN (SELECT m_id, u_id FROM movie_clip WHERE u_id = ?) mc ON(m.movie_id = mc.m_id) '+
    'JOIN (SELECT basket_name, basket_id FROM basket) AS bn ON(m.basket_id = bn.basket_id)';

    dbPool.getConnection(function(error, dbConn) {
        if(error) {
            logger.debug("In function showRecommendedMovie, Get Connection Error");
            return callback(error);
        }

        var showMessage = {};
        if (mypageInfo.member_token =='') {
            dbConn.release();
            logger.debug("In function showRecommendedMovie, token is none, member is not logined");
            showMessage = {message : "is not logined"};
            return callback(null, showMessage);
        }
        dbConn.beginTransaction (function (error) {
            if (error) {
                logger.debug("In function showRecommendedMovie, Begin Transaction Error");
                dbConn.release();
                return callback(error);
            }
            var member_id = jwt.decodeToken(mypageInfo.member_token).member_id;
            dbConn.query(sql_movieReccomend, [member_id, member_id], function(error, rows) {
                if (error) {
                    logger.debug("In function showRecommendedMovie, query error : "+sql_movieReccomend);
                    return dbConn.rollback(function () {
                        dbConn.release();
                        callback(error);
                    });
                }
                dbConn.commit(function (){
                    dbConn.release();
                    logger.debug("Showing recommended movie list success. member id : "+member_id);
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
        logger.debug("In function settingMypage, token is none, member is not logined");
        showMessage = {message : "is not logined"};
        return callback(null, showMessage);
    }
    var decodedToken = jwt.decodeToken(settingInfo.member_token);
    showMessage = {
        member_name : decodedToken.member_name,
        member_email : decodedToken.member_email,
        member_image : decodedToken.member_image
    }
    logger.debug("show setting my page success member email : "+decodedToken.member_email);
    return callback(null, showMessage);
}



//movie-delete
function deleteMyMovie(movieDeleteInfo, callback){
    var sql_update_my_movie_delete =
        'delete from movie_clip where m_id = ? and u_id = ?';

    dbPool.getConnection(function (error,dbConn) {
        if(error){
            logger.debug("In function deleteMyMovie, Get Connection Error");
            dbConn.release();
            return callback(error);
        }
        var movieCartMessage = {};
        if (movieDeleteInfo.member_token == '') {
            logger.debug("In function deleteMyMovie, token is none, member is not logined");
            movieCartMessage = {message : "is not logined"};
            dbConn.release();
            return callback(null, movieCartMessage);
        }
        var decodedToken = jwt.decodeToken(movieDeleteInfo.member_token);
        dbConn.query(
            sql_update_my_movie_delete,
            [movieDeleteInfo.movie_id, decodedToken.member_id],
            function (error, rows) {
                if (error) {
                    logger.debug("In function deleteMyMovie, query error : "+sql_update_my_movie_delete);
                    dbConn.release();
                    return callback(error);
                }
                else if (rows.affectedRows == 0) {
                    logger.debug("In function deleteMyMovie, delete failed");
                    return callback({message : "fail delete"});
                }
                else {
                    dbConn.release();
                    logger.debug("delete my movie success movie id : "+movieDeleteInfo.movie_id+" member email : "+decodedToken.member_email);
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
            logger.debug("In function deleteBasket, Get Connection Error");
            return callback(error);
        }

        var sendMessage = {};
        if (basketInfo.member_token =='') {
            logger.debug("In function deleteBasket, token is none, member is not logined");
            dbConn.release();
            sendMessage = { message : "is not logined"};
            return callback(null, sendMessage);
        }

        dbConn.beginTransaction (function (error) {
            if (error) {
                logger.debug("In function deleteBasket, Begin Transaction Error");
                dbConn.release();
                return callback(error);
            }
            var decodedToken = jwt.decodeToken(basketInfo.member_token);
            async.series([updateBasketList, updateBasketLike], function (error, results) {
                if (error) {
                    return dbConn.rollback( function () {
                        dbConn.release();
                        callback(error);
                    });
                }
                dbConn.commit(function () {
                    dbConn.release();
                    logger.debug("delete basket success member_email : "+decodedToken.member_email+" basket id : "+basketInfo.basket_id);
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
                        decodedToken.member_id
                    ],
                    function (error, rows) {
                        if (error) {
                            logger.debug("In function deleteBasket - updateBasketList, query error : "+sql_update_basket_list);
                            return done(error);
                        }
                        else if (rows.affectedRows == 0) {
                            logger.debug("In function deleteBasket - updateBasketList, delete failed");
                            return done({message : "delete failed"});
                        }
                        else {
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
                            logger.debug("In function deleteBasket - updateBasketList, query error : "+sql_update_basket_like);
                            return done(error);
                        }
                        else {
                            return done(null);
                        }
                    }
                );
            }
        });
    });
}

module.exports.basicMypage = basicMypage;
module.exports.showMyBasket = showMyBasket;
module.exports.showCartedMovie = showCartedMovie;
module.exports.showRecommendedMovie = showRecommendedMovie;
module.exports.settingMypage = settingMypage;
module.exports.deleteMyMovie = deleteMyMovie;
module.exports.deleteBasket = deleteBasket;

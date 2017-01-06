var dbPool = require('./common').dbPool;
var Common = require('./common');
var async = require('async');
var jwt = require('./jwt');
var Crawler = require('./crawler');
var logger = require('./winston').logger;
var server_error = {message : "internal server error"};
// 홈 화면에서 바스켓 조회
function showBaksets (basketInfo, callback) {

    // sort 방식에 따른 다른 쿼리문
    var sql_basket_shows = [
        'SELECT basket_id, basket_name, basket_image, basket_like, (CASE WHEN u_id IS NULL THEN 0 ELSE 1 END) AS is_liked '+
        'FROM basket b '+
        'LEFT JOIN (SELECT b_id, u_id FROM basket_heart WHERE u_id = ?) bh ON(b.basket_id = bh.b_id) '+
        'ORDER BY b.basket_rank ',
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
            logger.debug("In function showBaskets, Get Connection Error");
            return callback(error);
        }

        var showMessage = {};
        if (basketInfo.member_token == '') {
            logger.debug("In function showBaskets, token is none, member is not logined");
            showMessage = {message : "is not logined"};
            dbConn.release();
            return callback(null, showMessage);
        }
        var decodedToken = jwt.decodeToken(basketInfo.member_token);
        dbConn.query(current_sql, [decodedToken.member_id], function (error, rows) {
            if (error) {
                logger.debug("In function showBaskets, query error : "+current_sql);
                dbConn.release();
                return callback(error);
            }
            else {
                dbConn.release();
                showMessage = { baskets : rows};
                logger.debug("member email : "+decodedToken.member_email+" Basket show completed");
                return callback(null, showMessage);
            }
        });
    });
}

// 바스켓 추천, 담기 처리 함수 // is_liked = 0 -> 1 , is_liked = 1 -> 0
// async 사용, 로그인 세션 이용
// 트렌젝션 적용
function likeBasket(basketLikeInfo, callback) {
    var sql_repetition = 'select * from basket_heart where b_id = ? and u_id=?';
    // 마이 바스켓 목록 업데이트
    var sql_update_my_basket =
        'insert into basket_heart(b_id, u_id) values (?, ?)';
    // 바스켓 추천 수 업데이트
    var sql_update_basket_like =
        'update basket set basket_like = basket_like + 1 where basket_id = ?';

    dbPool.getConnection(function(error,dbConn) {
        if(error) {
            dbConn.release();
            logger.debug("In function likeBasket, Get Connection Error");
            return callback({message : "like update failed"});
        }

        var basketLikeMessage = {};
        var isRepetition = false;
        if (basketLikeInfo.member_token =='') {
            dbConn.release();
            logger.debug("In function likeBasket, token is none, member is not logined");
            basketLikeMessage = {message : "is not logined"};
            return callback(null, basketLikeMessage);
        }

        dbConn.beginTransaction (function (error) {
            if (error) {
                logger.debug("In function likeBasket, Begin Transaction error");
                dbConn.release();
                return callback(error);
            }
            var decodedToken = jwt.decodeToken(basketLikeInfo.member_token);
            async.series([checkBasketRepitition, updateMyBasket, updateBasketLike], function (error, results) {
                if (error) {
                    return dbConn.rollback(function () {
                        dbConn.release();
                        return callback({message : "like update failed"});
                    });
                }
                dbConn.commit(function () {
                    dbConn.release();
                    logger.debug("In function likeBasket, like update success member email : "+decodedToken.member_email+" basket id : "+basketLikeInfo.basket_id);
                    return callback(null, basketLikeMessage);
                });
            });

            function checkBasketRepitition (done) {
              dbConn.query(sql_repetition,[basketLikeInfo.basket_id, decodedToken.member_id], function (err, rows){
                if (error) {
                    logger.debug("In function likeBasket - checkBasketRepitition, query error : "+sql_repetition);
                    return done(error);
                }
                else if (rows.length > 0) {
                    logger.debug("In function likeBasket - checkBasketRepitition, repetition checked");
                    basketLikeMessage = {message : "like update failed" };
                    isRepetition = true;
                    return done(null);
                }
                return done(null);
              });
            };

            // 자신의 바스켓 목록 업데이트 함수
            function updateMyBasket (done) {
                if (isRepetition) {
                  return done(null);
                }
                dbConn.query
                (
                    sql_update_my_basket,
                    [
                        basketLikeInfo.basket_id,
                        decodedToken.member_id
                    ],
                    function (error, rows) {
                        if (error) {
                            logger.debug("In function showBaskets - updateMyBasket, query error : "+sql_update_my_basket);
                            return done(error);
                        }
                        else if (rows.affectedRows == 0) {
                            logger.debug("In function showBaskets - updateMyBasket, query error : delete failed");
                            return done(server_error);
                        }
                        else {
                          basketLikeMessage = {message : "like update success"};
                            return done(null);
                        }
                    }
                );
            }
        // 바스켓 좋아요 수 업데이트 함수
            function updateBasketLike (done) {
                if (isRepetition) {
                  return done(null);
                }
                dbConn.query
                (
                    sql_update_basket_like,
                    [basketLikeInfo.basket_id],
                    function (error, rows) {
                        if (error) {
                            logger.debug("In function showBaskets - updateBasketLike, query error : "+sql_update_basket_like);
                            return done(server_error);
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

// basket 내부의 영화 목록을 보여주는 함수
// basket_id 에 따라 부르고 좋아요 여부를 확인하기 위해 member_id에 따라 left join을 한다.
function showBasketDetail (info, callback) {
    var sql_basket_detail =
        'SELECT movie_id, movie_title, movie_image, movie_pub_date, movie_director, movie_user_rating, movie_link, movie_adder, movie_like,'+
        '(CASE WHEN mh.u_id IS NULL THEN 0 ELSE 1 END) AS is_liked, '+
        '(CASE WHEN mc.u_id IS NULL THEN 0 ELSE 1 END) AS is_cart '+
        'FROM movie AS m '+
        'LEFT JOIN (SELECT m_id, u_id FROM movie_heart WHERE u_id = ?) AS mh ON(m.movie_id = mh.m_id) '+
        'LEFT JOIN (SELECT m_id, u_id FROM movie_clip WHERE u_id = ?) mc ON(m.movie_id = mc.m_id) '+
        'WHERE basket_id = ? '+
        'ORDER BY m.movie_like DESC';

    dbPool.getConnection ( function (error, dbConn) {
        if (error) {
            logger.debug("In function showBasketDetail, Get Connection Error");
            return callback(error);
        }

        var basketDetailMessage = {};
        if (info.member_token == '') {
            logger.debug("In function showBasketDetail, token is none, member is not logined");
            dbConn.release();
            basketDetailMessage = {message : "is not logined"};
            return callback(null, basketDetailMessage);
        }

        var decodedToken = jwt.decodeToken(info.member_token);
        dbConn.query
        (
            sql_basket_detail,
            [decodedToken.member_id, decodedToken.member_id, info.basket_id],
            function (error, rows) {
                if (error) {
                  dbConn.release();
                  logger.debug("In function showBasketDetail, query error : "+sql_basket_detail);
                  return callback({message : "basket detail failed"});
                }
                else {
                    dbConn.release();
                    logger.debug("In function showBasketDetail, show basket detail success. member_email : "+decodedToken.member_email+" basket id : "+ info.basket_id);
                    basketDetailMessage = { result : Common.refineMovieRating(rows)}
                    return callback(null, basketDetailMessage);
                }
            }
        );
    });
}
// 영화 추천 처리 함수
function movieRecommend (info, callback) {
    var sql_update_my_movie_recommend = [
        'insert into movie_heart(m_id, u_id) values (?, ?)',
        'delete from movie_heart where m_id = ? and u_id =?'
    ];

    var sql_update_movie_recommend = [
        'update movie set movie_like = movie_like + 1 where movie_id = ?',
        'update movie set movie_like = movie_like - 1 where movie_id = ?'
    ];

    dbPool.getConnection (function (error,dbConn) {
        if (error) {
            logger.debug("In function movieRecommend, Get Connection Error");
            return callback(error);
        }

        var movieRecommendMessage = {};
        if (info.member_token == '') {
            dbConn.release();
            logger.debug("In function movieRecommend, token is none, member is not logined");
            movieRecommendMessage = { message : "is not logined"};
            return callback(null, movieRecommendMessage);
        }

        async.series([updateMyMovieRecommend, updateMovieRecommend], function (error, results) {
            if (error) {
                dbConn.release();
                return callback(error);
            }
            dbConn.release();
            logger.debug("In function movieRecommend, update success. movie id : "+info.movie_id +" before liked : "+info.is_liked);
            movieRecommendMessage = {message : "movie recommend updated"};
            return callback(null, movieRecommendMessage);
        });

        function updateMyMovieRecommend (done) {
            dbConn.query(
                sql_update_my_movie_recommend[info.is_liked],
                [info.movie_id, jwt.decodeToken(info.member_token).member_id],
                function (error, rows) {
                    if (error) {
                        logger.debug("In function movieRecommend - updateMyMovieRecommend, query error : "+sql_update_my_movie_recommend[info.is_liked]+" movie id : "+info.movie_id);
                        return done({message : "fail delete"});
                    }
                    else if (rows.affectedRows == 0) {
                        logger.debug("In function movieRecommend - updateMyMovieRecommend, query error : delete failed "+" movie id : "+info.movie_id);
                        return done({message : "fail delete"});
                    }
                    else {
                        return done(null);
                    }
                }
            );
        }

        function updateMovieRecommend (done) {
            dbConn.query(
                sql_update_movie_recommend[info.is_liked],
                [info.movie_id],
                function (error, rows) {
                    if (error) {
                        logger.debug("In function movieRecommend - updateMovieRecommend, query error : "+sql_update_movie_recommend[info.is_liked]);
                        return done(error);
                    }
                    else {
                        return done(null);
                    }
                }
            );
        }
    });
}

// 영화 담기 처리 함수
function movieCart(info, callback){
    var sql_update_my_movie_cart = [
        'insert into movie_clip(m_id, u_id) values (?, ?)',
        'delete from movie_clip where m_id = ? and u_id = ?'
    ];

    dbPool.getConnection(function (error,dbConn) {
        if(error){
            logger.debug("In function movieCart, Get Connection error");
            return callback(error);
        }
        var movieCartMessage = {};
        if (info.member_token == '') {
            logger.debug("In function movieCart, token is none, member is not logined");
            movieCartMessage = {message : "is not logined"};
            dbConn.release();
            return callback(null, movieCartMessage);
        }
        var decodedToken = jwt.decodeToken(info.member_token);
        dbConn.query(
            sql_update_my_movie_cart[info.is_carted],
            [info.movie_id, decodedToken.member_id],
            function (error, rows) {
                if (error) {
                    logger.debug("In function movieCart, query error : "+sql_update_my_movie_cart[info.is_carted] +" movie id : "+info.movie_id);
                    dbConn.release();
                    return callback(error);
                }
                else if (rows.affectedRows == 0) {
                    logger.debug("In function movieCart, query error : delete failed "+" movie id : "+info.movie_id);
                    dbConn.release();
                    return done(server_error);
                }
                else {
                    dbConn.release();
                    logger.debug("In function movieCart, member email : "+decodedToken.member_email+" movie id : "+info.movie_id);
                    movieCartMessage = {message : "movie cart success"};
                    return callback(null, movieCartMessage);
                }
            }
        );
    });
}

// 바스켓에 영화 정보 추가, 동시에 마이 영화 추천 정보에 영화 추가
// 트랜젝션 적용
function movieAdd(info, callback){
    var sql_repetition = 'select * from movie where movie_title = ? and basket_id=?';
    var sql_movie_add =
        'insert into movie '+
        '(movie_title, movie_image, movie_director, movie_pub_date, movie_user_rating, movie_link, movie_adder, movie_add_date, movie_like, basket_id) '+
        'values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var sql_my_movie_add = 'insert into movie_heart (m_id, u_id) values (?, ?)';
    var sql_my_movie_id = 'select movie_id from movie where movie_title = ? and basket_id = ?';
    dbPool.getConnection (function (error,dbConn) {
        if (error) {
            logger.debug("In function movieAdd, Get Connection Error");
            return callback(error);
        }

        var isRepetition = false;
        var movieAddMessage = {};
        if (info.member_token == '') {
            dbConn.release();
            logger.debug("In function movieAdd, token is none, member is not logined");
            movieAddMessage = {message : "is not logined"};
            return callback(null, movieAddMessage);
        }

        dbConn.beginTransaction(function (error) {
            if (error) {
                logger.debug("In function movieAdd, Begin Transaction Error");
                dbConn.release();
                return callback(error);
            }
            var movieId;
            var decodedToken = jwt.decodeToken(info.member_token);
            async.series([checkRepetition, updateMovieAdd, getMovieId, updateMyMovieLike], function (error, results) {
                if (error) {
                    return dbConn.rollback(function () {
                        dbConn.release();
                        return callback(error);
                    });
                }
                dbConn.commit(function () {
                    dbConn.release();
                    logger.debug("Movie add success. member email : "+decodedToken.member_email+" basket id : "+info.basket_id+" movie title : "+info.movie_title);
                    return callback(null, movieAddMessage);
                });
            });

            // 영화 담기 중복확인
            function checkRepetition (done) {
              dbConn.query(sql_repetition,[info.movie_title, info.basket_id], function (err, rows){
                if (error) {
                    logger.debug("In function movieAdd - checkRepetition, query error : "+sql_repetition);
                    return done(error);
                }
                else if (rows.length > 0) {
                    movieAddMessage = {message : "movie add failed" };
                    logger.debug("In function movieAdd - checkRepetition, check repetition");
                    isRepetition = true;
                    return done(null);
                }
                return done(null);
              });
            };
            // 영화 테이블에 영화 추가
            function updateMovieAdd (done) {
              if (isRepetition) {
                return done(null);
              }
                dbConn.query(
                    sql_movie_add,
                    [
                        info.movie_title,
                        info.movie_image,
                        info.movie_director,
                        info.movie_pub_date,
                        info.movie_user_rating,
                        info.movie_link,
                        decodedToken.member_name,
                        new Date(),
                        1,
                        info.basket_id
                    ],
                    function (error, rows) {
                        if (error) {
                            logger.debug("In function movieAdd - updateMovieAdd, query error : "+sql_movie_add);
                            return done(error);
                        }
                        else {
                            return done(null);
                        }
                    }
                );
            }

            // 영화 id를 위하여 검색
            function getMovieId (done) {
                if (isRepetition) {
                    return done(null);
                }
                dbConn.query(
                    sql_my_movie_id,
                    [info.movie_title, info.basket_id],
                    function (error, rows) {
                        if (error) {
                            logger.debug("In function movieAdd - getMovieId, query error : "+sql_my_movie_id);
                            return done(error);
                        }
                        else if (rows.length == 0) {
                            logger.debug("In function movieAdd - getMovieId, select failed");
                            return done({message : 'cannot select row'});
                        }
                        else {
                            movieId = rows[0].movie_id;
                            return done(null);
                        }
                    }
                );
            }

            // 내 영화 정보에 영화 추가
            function updateMyMovieLike (done) {
                if (isRepetition) {
                    return done(null);
                }
                dbConn.query(
                    sql_my_movie_add,
                    [movieId, decodedToken.member_id],
                    function (error, rows) {
                        if (error) {
                            logger.debug("In function movieAdd - updateMyMovieLike, query error : "+sql_my_movie_add);
                            return done(error);
                        }
                        else {
                            movieAddMessage = {message : "movie add success"};
                            return done(null);
                        }
                    }
                );
            }
        });
    });
}

function getMovieInfo (info, callback) {
    var link ='';
    var sendMessage = {};
    var sql_movie_info = 'select movie_title, movie_pub_date, movie_image, movie_director, movie_user_rating, movie_link from movie where movie_id = ?'
    dbPool.getConnection (function (error, dbConn) {
        if (error) {
            logger.debug("In function getMovieInfo, get connection error");
            return callback(server_error);
        }

        async.series([findMovieInfo, findCrawlingInfo], function (error, results) {
            if (error) {
                dbConn.release();
                return callback(server_error);
            }
            dbConn.release();
            logger.debug("get movie information success. movie id : "+info.movie_id);
            return callback(null, sendMessage);
        });

        function findMovieInfo (done) {
            dbConn.query
            (
                sql_movie_info,
                [info.movie_id],
                function (error, rows) {
                    if (error) {
                        logger.debug("In function getMovieInfo - findMovieInfo , query error : "+sql_movie_info);
                        return done(server_error);
                    }
                    rows = Common.refineMovieRating(rows);
                    sendMessage.movie_title = rows[0].movie_title;
                    sendMessage.movie_pub_date = rows[0].movie_pub_date;
                    sendMessage.movie_image = rows[0].movie_image;
                    sendMessage.movie_director = rows[0].movie_director;
                    sendMessage.movie_user_rating = rows[0].movie_user_rating;
                    link = rows[0].movie_link;
                    return done(null);
                }
            );
        }

        function findCrawlingInfo (done) {
            Crawler.findContent (link, function (error, results) {
                if (error) {
                    logger.debug("In function getMovieInfo - findCrawlingInfo, Error : "+error);
                    return done(error);
                }
                else {
                    sendMessage.content = results.content;
                    sendMessage.actors = results.actor;
                    return done(null);
                }
            });
        }
    });
}


module.exports.showBaksets = showBaksets;
module.exports.likeBasket = likeBasket;
module.exports.showBasketDetail = showBasketDetail;
module.exports.movieRecommend = movieRecommend;
module.exports.movieCart = movieCart;
module.exports.movieAdd = movieAdd;
module.exports.getMovieInfo = getMovieInfo;

var dbPool = require('./common').dbPool;
var Common = require('./common');
var async = require('async');
var jwt = require('./jwt');
var Crawler = require('./crawler');
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
            return callback(error);
        }

        var showMessage = {};
        if (basketInfo.member_token == '') {
            showMessage = {message : "is not logined"};
            dbConn.release();
            return callback(null, showMessage);
        }

        dbConn.query(current_sql, [jwt.decodeToken(basketInfo.member_token).member_id], function (error, rows) {
            if (error) {
              dbConn.release();
              return callback(error);
            }
            else {
                dbConn.release();
                showMessage = { baskets : rows};
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
        if(error){
          dbConn.release();
          return callback({message : "like update failed"});
        }

        var basketLikeMessage = {};
        var isRepetition = false;
        if (basketLikeInfo.member_token =='') {
            dbConn.release();
            basketLikeMessage = {message : "is not logined"};
            return callback(null, basketLikeMessage);
        }

        dbConn.beginTransaction (function (error) {
            if (error) {
                dbConn.release();
                return callback(error);
            }

            async.series([checkBasketRepitition, updateMyBasket, updateBasketLike], function (error, results) {
                if (error) {
                    return dbConn.rollback(function () {
                        dbConn.release();
                        //return callback(error);
                        callback({message : "like update failed"});
                    });
                }
                dbConn.commit(function () {
                    dbConn.release();
                    //basketLikeMessage = {message : "like update success"};
                    callback(null, basketLikeMessage);
                });
            });

            function checkBasketRepitition (done) {
              dbConn.query(sql_repetition,[basketLikeInfo.basket_id, jwt.decodeToken(basketLikeInfo.member_token).member_id], function (err, rows){
                if (error) {
                    return done(error);
                }
                else if (rows.length > 0) {
                    basketLikeMessage = {message : "basket add failed" };
                    isRepetition = true;
                    console.log("is REpetition");
                    return done(null);
                }
                console.log("done checkREpitition");
                return done(null);
                //return done(new Error("movie add failed"));
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
                        jwt.decodeToken(basketLikeInfo.member_token).member_id
                    ],
                    function (error, rows) {
                        if (error) {
                            return done(error);
                        }
                        else if (rows.affectedRows == 0) {
                            return done(new Error("fail delete"));
                        }
                        else {
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

// basket 내부의 영화 목록을 보여주는 함수
// basket_id 에 따라 부르고 좋아요 여부를 확인하기 위해 member_id에 따라 left join을 한다.
function showBasketDetail (basketDetailInfo, callback) {
    var sql_basket_detail =
        'SELECT movie_id, movie_title, movie_image, movie_pub_date, movie_director, movie_user_rating, movie_link, movie_adder, movie_like,'+
        '(CASE WHEN mh.u_id IS NULL THEN 0 ELSE 1 END) AS is_liked, '+
        '(CASE WHEN mc.u_id IS NULL THEN 0 ELSE 1 END) AS is_cart '+
        'FROM movie AS m '+
        'LEFT JOIN (SELECT m_id, u_id FROM movie_heart WHERE u_id = ?) AS mh ON(m.movie_id = mh.m_id) '+
        'LEFT JOIN (SELECT m_id, u_id FROM movie_clip WHERE u_id = ?) mc ON(m.movie_id = mc.m_id) '+
        'WHERE basket_id = ? '
        'ORDER BY m.movie_like DESC';

    dbPool.getConnection ( function (error, dbConn) {
        if (error) {
            return callback(error);
        }

        var basketDetailMessage = {};

        if (basketDetailInfo.member_token == '') {
            dbConn.release();
            basketDetailMessage = {message : "is not logined"};
            return callback(null, basketDetailMessage);
        }

        dbConn.query
        (
            sql_basket_detail,
            [jwt.decodeToken(basketDetailInfo.member_token).member_id, jwt.decodeToken(basketDetailInfo.member_token).member_id, basketDetailInfo.basket_id],
            function (error, rows) {
                if (error) {
                  dbConn.release();
                  return callback({message : "basket detail failed"});
                }
                else {
                    dbConn.release();
                    basketDetailMessage = { result : Common.refineMovieRating(rows)}
                    return callback(null, basketDetailMessage);
                }
            }
        );
    });
}
// 영화 추천 처리 함수
function movieRecommend (movieRecommendInfo, callback) {
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
            return callback(error);
        }

        var movieRecommendMessage = {};
        if (movieRecommendInfo.member_token == '') {
            dbConn.release();
            movieRecommendMessage = { message : "is not logined"};
            return callback(null, movieRecommendMessage);
        }

        async.series([updateMyMovieRecommend, updateMovieRecommend], function (error, results) {
            if (error) {
                dbConn.release();
                return callback(error);
            }
            dbConn.release();
            movieRecommendMessage = {message : "movie recommend updated"};
            return callback(null, movieRecommendMessage);
        });

        function updateMyMovieRecommend (done) {
            dbConn.query(
                sql_update_my_movie_recommend[movieRecommendInfo.is_liked],
                [movieRecommendInfo.movie_id, jwt.decodeToken(movieRecommendInfo.member_token).member_id],
                function (error, rows) {
                    if (error) {
                        console.log(error);
                        return done({message : "fail delete"});
                    }
                    else if (rows.affectedRows == 0) {
                        return done({message : "fail delete"});
                    }
                    else {
                      if(movieRecommendInfo.is_liked==0){
                        console.log("change to like");
                      }
                      else{
                        console.log("change to delete");
                      }
                        return done(null);
                    }
                }
            );
        }

        function updateMovieRecommend (done) {
            dbConn.query(
                sql_update_movie_recommend[movieRecommendInfo.is_liked],
                [movieRecommendInfo.movie_id],
                function (error, rows) {
                    if (error) {
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
function movieCart(movieCartInfo, callback){
    var sql_update_my_movie_cart = [
        'insert into movie_clip(m_id, u_id) values (?, ?)',
        'delete from movie_clip where m_id = ? and u_id = ?'
    ];

    dbPool.getConnection(function (error,dbConn) {
        if(error){
            return callback(error);
        }
        var movieCartMessage = {};
        if (movieCartInfo.member_token == '') {
            movieCartMessage = {message : "is not logined"};
            dbConn.release();
            return callback(null, movieCartMessage);
        }

        dbConn.query(
            sql_update_my_movie_cart[movieCartInfo.is_carted],
            [movieCartInfo.movie_id, jwt.decodeToken(movieCartInfo.member_token).member_id],
            function (error, rows) {
                if (error) {
                    dbConn.release();
                    return callback(error);
                }
                else if (rows.affectedRows == 0) {
                    dbConn.release();
                    return done(new Error("fail delete"));
                }
                else {
                    dbConn.release();
                    movieCartMessage = {message : "movie cart success"};
                    return callback(null, movieCartMessage);
                }
            }
        );
    });
}

// 바스켓에 영화 정보 추가, 동시에 마이 영화 추천 정보에 영화 추가
// 트랜젝션 적용
function movieAdd(movieAddInfo, callback){
    var sql_repetition = 'select * from movie where movie_title = ? and basket_id=?';
    var sql_movie_add =
        'insert into movie '+
        '(movie_title, movie_image, movie_director, movie_pub_date, movie_user_rating, movie_link, movie_adder, movie_add_date, movie_like, basket_id) '+
        'values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var sql_my_movie_add = 'insert into movie_heart (m_id, u_id) values (?, ?)';
    var sql_my_movie_id = 'select movie_id from movie where movie_title = ? and basket_id = ?';
    dbPool.getConnection (function (error,dbConn) {
        if (error) {
            return callback(error);
        }
        var my_movie_checkRepititionMessage = {};
        var isRepetition = false;
        var movieAddMessage = {};
        if (movieAddInfo.member_token == '') {
            dbConn.release();
            movieAddMessage = {message : "is not logined"};
            return callback(null, movieAddMessage);
        }

        dbConn.beginTransaction(function (error) {
            if (error) {
                dbConn.release();
                return callback(error);
            }
            var movieId;
            async.series([checkRepitition, updateMovieAdd, getMovieId, updateMyMovieLike], function (error, results) {
                if (error) {
                    return dbConn.rollback(function () {
                        dbConn.release();
                        return callback(error);
                    });
                }
                dbConn.commit(function () {
                    dbConn.release();
                    return callback(null, movieAddMessage);
                });
            });

            // 영화 담기 중복확인
            function checkRepitition (done) {
              dbConn.query(sql_repetition,[movieAddInfo.movie_title, movieAddInfo.basket_id], function (err, rows){
                if (error) {
                    return done(error);
                }
                else if (rows.length > 0) {
                    movieAddMessage = {message : "movie add failed" };
                    isRepetition = true;
                    console.log("is REpetition");
                    return done(null);
                }
                console.log("done checkREpitition");
                return done(null);
                //return done(new Error("movie add failed"));
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
                        movieAddInfo.movie_title,
                        movieAddInfo.movie_image,
                        movieAddInfo.movie_director,
                        movieAddInfo.movie_pub_date,
                        movieAddInfo.movie_user_rating,
                        movieAddInfo.movie_link,
                        jwt.decodeToken(movieAddInfo.member_token).member_name,
                        new Date(),
                        1,
                        movieAddInfo.basket_id
                    ],
                    function (error, rows) {
                        if (error) {
                            return done(error);
                        }
                        else {
                            console.log("done updateMovieAdd");
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
                    [movieAddInfo.movie_title, movieAddInfo.basket_id],
                    function (error, rows) {
                        if (error) {
                            return done(error);
                        }
                        else if (rows.length == 0) {
                            return done(new Error('cannot select row'));
                        }
                        else {
                            movieId = rows[0].movie_id;
                            return done(null);
                            console.log("done getMovieId");
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
                    [movieId, jwt.decodeToken(movieAddInfo.member_token).member_id],
                    function (error, rows) {
                        if (error) {
                            return done(error);
                        }
                        else {
                            movieAddMessage = {message : "movie add success"};
                            return done(null);
                            console.log("done updateMyMovieLike");
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
            return callback(server_error);
        }

        async.series([findMovieInfo, findCrawlingInfo], function (error, results) {
            if (error) {
                dbConn.release();
                return callback(server_error);
            }
            dbConn.release();
            return callback(null, sendMessage);
        });

        function findMovieInfo (done) {
            dbConn.query
            (
                sql_movie_info,
                [info.movie_id],
                function (error, rows) {
                    if (error) {
                        console.log(error);
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

var dbPool = require('./common').dbPool;
var jwt = require('./jwt');
var async = require('async');
var _ = require('underscore');
//var crypto = require('crypto');


//category 검색 메인 화면
function category (callback) {
    var sql_category_todayRecommend = 'SELECT c_id, small_category FROM category WHERE today_recommand=1';
    var sql_category = 'SELECT c_id, small_category, big_category FROM category';
    dbPool.getConnection(function(error,dbConn){
        if(error){
            return callback(error);
        }
        var categoryMessage = {};

        dbConn.beginTransaction (function (error) {
            if (error) {
                dbConn.release();
                return callback(error);
            }

            async.series([categoryTodayRecommend, categoryAll], function(error, results){
                if(error){
                    return dbConn.rollback(function () {
                        dbConn.release();
                        callback(error);
                    });
                }
                dbConn.commit(function () {
                    dbConn.release();
                    callback(null, categoryMessage);
                });
            });

            function categoryTodayRecommend(done){
                dbConn.query(sql_category_todayRecommend, function(err,rows){
                    if(error){
                        return done(error);
                    }
                    else{
                        categoryMessage.today_recommand = rows;
                    }
                    return done(null);
                });
            }

            function categoryAll(done){
                dbConn.query(sql_category, function(err, rows){
                    if (error) {
                        return done(error);
                    }
                    else {
                        categoryMessage.categories = [];
                        for (var i = 0 ; i < 3 ; i++) {
                            categoryMessage.categories.push(_.filter(rows, function(item) {
                                return item.big_category == i+1;
                            }));
                        }
                    return done(null);
                    }
                });
            }
        });
    });
}

//카테고리 선택 후 바스켓 조회 함수
function detailCategory (searchInfo, callback) {
    var sql_detail_category =
    'SELECT '+
    'basket_id, basket_name, basket_image, basket_like, (CASE WHEN u_id IS NULL THEN 0 ELSE 1 END) AS is_liked '+
    'FROM basket AS b LEFT JOIN (SELECT b_id, u_id FROM basket_heart WHERE u_id = ?) AS bh ON (b.basket_id = bh.b_id) '+
  	'JOIN (SELECT c_id, b_id FROM categoryKey WHERE c_id = ?) AS ck ON (b.basket_id = ck.b_id)';

    dbPool.getConnection(function(error,dbConn){

        if(error){
            return callback(error);
        }

        var showMessage = {};

        if (searchInfo.member_token == '') {
            dbConn.release();
            showMessage = {message : "is not logined"};
            return callback(null, showMessage);
        }

        dbConn.beginTransaction (function (error) {
            if (error) {
                dbConn.release();
                return callback(error);
            }
            dbConn.query(sql_detail_category, [jwt.decodeToken(searchInfo.member_token).member_id, searchInfo.c_id], function (error, rows) {
                if (error) {
                    return dbConn.rollback(function () {
                        dbConn.release();
                        callback(error);
                    });
                }
                dbConn.commit(function () {
                    dbConn.release();
                    showMessage = { baskets : rows};
                    return callback(null, showMessage);
                });
            });
        });
    });
}

module.exports.category = category;
module.exports.detailCategory = detailCategory;

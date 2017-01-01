var dbPool = require('./common').dbPool;
var async = require('async');
var _ = require('underscore');

function category (callback) {
    var sql_basket = 'SELECT basket_name from basket';
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

            async.series([basketAll, categoryAll], function(error, results){
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

            function basketAll(done){
                dbConn.query(sql_basket, function(err,rows){
                    if(error){
                        return done(error);
                    }
                    else{
                        categoryMessage.baskets = rows;
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

module.exports.category = category;

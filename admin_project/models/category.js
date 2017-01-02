var dbPool = require('./common').dbPool;
var async = require('async');
var _ = require('underscore');

function category (callback) {
    var sql_basket = 'SELECT basket_id, basket_name from basket';
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
                        categoryMessage.categories = rows;
                    }
                    return done(null);

                });
            }
        });
    });
}

function updateCategoryList (info, callback) {

    var sql_delete_categories = 'DELETE from categoryKey WHERE b_id = ';
        sql_delete_categories += ''+info.basket+'';

    var sql_update_categories =
        'INSERT INTO categoryKey(c_id, b_id) VALUES ';
    for( var i =0; i < info.checks.length; i++){
        if(i != (info.checks.length - 1)){
            sql_update_categories += '(' + info.checks[i] + ' , ' + info.basket + '),';
        }
        else {
            sql_update_categories += '(' + info.checks[i] + ' , ' + info.basket + ')';
        }
    }

    dbPool.getConnection(function (error, dbConn) {
        if (error) {
            console.log("Connection error " + error);
            return callback(error);
        }
        var sendMessage = {};
        dbConn.beginTransaction(function (error) {
            if (error) {
                dbConn.release();
                return callback(error);
            }

            async.series([deleteCategories, updateCategories], function (error, result) {
                if (error) {
                    return dbConn.rollback(function () {
                        dbConn.release();
                        callback(error);
                    });
                }
                dbConn.commit(function () {
                    dbConn.release();
                    callback(null, sendMessage);
                });
            });

            function deleteCategories(done) {
                dbConn.query(sql_delete_categories, function (error, rows) {
                    if (error) {
                        console.log("Connection Error" + error);
                        done(error);
                    }
                    else {
                        sendMessage = {message : "success"};
                        done(null);
                    }
                });
            }

            function updateCategories(done) {
                dbConn.query(sql_update_categories, function (error, rows) {
                    if (error) {
                        console.log("Connection Error" + error);
                        done(error);
                    }
                    else {
                        sendMessage = {message : "success"};
                        done(null);
                    }
                });
            }
        });
    });
}

module.exports.category = category;
module.exports.updateCategoryList = updateCategoryList;

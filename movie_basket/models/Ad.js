var dbPool = require('./common').dbPool;
var async = require('async');
var jwt = require('./jwt');


function recommendCategory(adInfo, callback) {
  var sql_recommendCategory =
  'SELECT small_category FROM Movie_Basket.category';

  dbPool.getConnection (function(error, dbConn) {
    if(error) {
      return callback(error);
    }
    var showMessage = {};
    dbConn.beginTransaction (function (error) {
        if (error) {
            dbConn.release();
            return callback(error);
        }
    dbConn.query(sql_recommendCategory, function(error, rows) {
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


module.exports.recommendCategory = recommendCategory;

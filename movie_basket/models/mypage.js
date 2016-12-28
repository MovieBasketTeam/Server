var dbPool = require('./common').dbPool;
var async = require('async');

function showMypages (mypageInfo, callback) {

  var sql_mypage_shows =
    'SELECT member_name,member_image from member where member_name = ?';
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
        showMessage = { mypages : rows }
        return callback(null, showMessage);
      }
    });
  });
}

module.exports.showBaksets = showMypages;

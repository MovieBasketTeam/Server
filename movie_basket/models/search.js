var dbPool = require('./common').dbPool;
var async = require('async');
//var crypto = require('crypto');


//category 검색 메인 화면
function category (search_Category_info, callback) {
  var sql_category_todayRecommend = 'SELECT c_id, small_category FROM category WHERE today_recommand=1';
  dbPool.getConnection(function(error,dbConn){
    if(error){
      return callback(error);
    }
    var result = {};
    dbConn.query(sql_category_todayRecommend, search_Category_info,function(err,rows){
      if(error){
        dbConn.release();
        return done(error);
      }
      else{
        dbConn.release();
        result = { today_recommand : rows};
        return callback(null, result);
      }
    });
  });
}

//카테고리 선택 후 밧켓 조회 함수
// function detailCategory (c_id) {
//   var sql_detail_category = '';

//ㅋ테고리 선택 후 밧켓 조회 함수
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
      dbConn.query(sql_detail_category, [searchInfo.u_id, searchInfo.c_id], function (error, rows) {
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

module.exports.category = category;
module.exports.detailCategory = detailCategory;

var dbPool = require('./common').dbPool;
var async = require('async');
//var crypto = require('crypto');


//category 검색 메인 화면
function category (search_Category_info, callback) {
  var sql_category_todayRecommend = 'SELECT c_id, small_category FROM category WHERE today_recommand=1';
  var sql_category = 'SELECT c_id, small_category, big_category FROM category WHERE big_category =1 OR 2 OR 3';
  dbPool.getConnection(function(error,dbConn){
    if(error){
      return callback(error);
    }
    var result_categoryMessage_today = {};
    var result_categoryMessage = {};

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
        callback(null, result_categoryMessage_today, result_categoryMessage);
      });
    });

    function categoryTodayRecommend(done){
      dbConn.query(sql_category_todayRecommend, search_Category_info, function(err,rows){
        if(error){
          return done(error);
        }
        else{
          result_categoryMessage_today = rows;
        }
        return done(null);
      });
    }

    // function categoryAll(done){
    //   dbConn.query(sql_category, search_Category_info, function(err, rows){
    //     if(error){
    //       return done(error);
    //     }
    //     else{
    //       result_categoryMessage = rows;
    //     }
    //     return done(null);
    //   });
    // }

    function categoryAll(done){
      dbConn.query(sql_category, search_Category_info, function(err, rows){
        if (error) {
          done(error);
        } else {
          //result_categoryMessage = rows;
          result_categoryMessage.big_category1 = [];
          result_categoryMessage.big_category2 = [];
          result_categoryMessage.big_category3 = [];
          async.each(rows, function(item, callback) {
              if( item.big_category === 1 ) {
                result_categoryMessage.big_category1.push({
                  c_id : item.c_id,
                  small_category : item.small_category,
                  big_category : item.big_category
                });
                // callback('File name too long');
              } else if ( item.big_category === 2 ) {
                result_categoryMessage.big_category2.push({
                  c_id : item.c_id,
                  small_category : item.small_category,
                  big_category : item.big_category
                });
              } else if ( item.big_category === 3 ) {
                result_categoryMessage.big_category3.push({
                  c_id : item.c_id,
                  small_category : item.small_category,
                  big_category : item.big_category
                });
              }
              callback();
          }, function(err) {
              // if any of the file processing produced an error, err would equal that error
              if( err ) {
                done(err);
              } else {
                done(null);
              }
          });
        }
      });
    }


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
    });
}

module.exports.category = category;
module.exports.detailCategory = detailCategory;

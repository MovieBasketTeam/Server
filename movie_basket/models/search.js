var dbPool = require('./common').dbPool;
var async = require('async');
//var crypto = require('crypto');


//category 검색 메인 화면
function category () {

}

//ㅋ테고리 선택 후 밧켓 조회 함수
function detailCategory (c_id) {
  var sql_detail_category = '';
  dbPool.getConnection(function(error,dbConn){
    if(error){
      return callback(error);
    }
    dbConn.query(sql_detail_category, []);
  });
}

module.exports.category = category;
module.exports.detailCategory = detailCategory;

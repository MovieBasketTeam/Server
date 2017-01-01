// 유틸 함수나 db 정보를 담아둔 모델

var mysql = require('mysql');
var db_config = require('../config/db_config.json');


// db pool 생성
var dbPool = mysql.createPool({
    host : db_config.host,
    port : db_config.port,
    user : db_config.user,
    password : db_config.password,
    database : db_config.database,
    connectionLimit : db_config.connectionLimit
});

// 영화 네이버 평점을 별점으로 변환해주는 함수
function refineMovieRating (rows) {
    for (var i = 0 ; i < rows.length ; i++) {
        var devidedRating = rows[i].movie_user_rating/2;
        rows[i].movie_user_rating = Math.round(devidedRating);
    }
    return rows;
}
module.exports.dbPool = dbPool;
module.exports.refineMovieRating = refineMovieRating;

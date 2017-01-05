var dbPool = require('./common').dbPool;
var crypto = require('crypto');
function cipherPassword (password) {
    var cipher = crypto.createCipher('aes256', 'password');
    cipher.update(password, 'ascii', 'hex');
    var cipherd = cipher.final('hex');
    return cipherd;
}
// 복호화 함수 암호화된 password를 넣으면 원래 password 값 리턴.
function decipherPassword (password) {
    var decipher = crypto.createDecipher('aes256', 'password');
    decipher.update(password, 'hex', 'ascii');
    var decipherd = decipher.final('ascii');
    return decipherd;
}
// 로그인 처리 함수
function logIn (logInInfo, callback) {
    var sql_login_check = 'select * from member where member_email = ? and member_pwd = ? and available = 1';
    dbPool.getConnection ( function (error, dbConn) {
        if (error) {
            return callback(error);
        }

        var logInMessage = {};
        dbConn.query(sql_login_check, [logInInfo.member_email, cipherPassword(logInInfo.member_pwd)], function (error, rows) {
            if (error) {
                dbConn.release();
                return callback(error);
            }
            // 로그인 성공
            if (rows.length >= 1) {
                dbConn.release();
                logInMessage =  {
                                    message : "login success",
                                    member_info : rows[0]
                                };
                console.log(logInMessage);
                return callback(null, logInMessage);

            }
            // 아이디 혹은 비밀번호가 잘못됨 혹은 탈퇴된 회원
            else {
                dbConn.release();
                logInMessage = { message : "check information"};
                return callback(null, logInMessage);
            }
        });
    });
}

module.exports.logIn = logIn;

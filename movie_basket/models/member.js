var dbPool = require('./common').dbPool;
var async = require('async');
var crypto = require('crypto');

// 암호화 함수 password 를 넣으면 암호화된 password 값을 리턴.
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


// 회원가입 중복확인 후 가입 처리를 해주는 함수
function signUp (signUpInfo, callback) {
    var sql_repetition = 'select * from member where member_email = ?';
    var sql_insert_member = 'insert into member(member_name, member_email, member_pwd) values (?, ?, ?)';
    dbPool.getConnection ( function (error, dbConn) {
        if (error) {
            return callback(err);
        }

        var signUpMessage = {};
        var isRepetition = false;
        async.series([checkRepetition, completeSignUp], function (error, results) {
            if (error) {
                dbConn.release();
                return callback(error);
            }
            dbConn.release();
            callback(null, signUpMessage);
        });
        // 중복 확인 함수
        function checkRepetition (done) {
            dbConn.query(sql_repetition, [signUpInfo.member_email], function (error, rows) {
                if (error) {
                    return done(error);
                }
                else if (rows.length > 0) {
                    signUpMessage = {result : "repetition"};
                    isRepetition = true;
                }
                return done(null);
            });
        }
        // 회원 가입 완료 처리 함수
        function completeSignUp (done) {
            if (isRepetition) {
                return done(null);
            }
            dbConn.query(sql_insert_member, [signUpInfo.member_name, signUpInfo.member_email, cipherPassword(signUpInfo.member_pwd)], function (error, rows) {
                if (error) {
                    return done(error);
                }
                signUpMessage = {result : "create"};
                return done(null);
            });
        }
    });
}

module.exports.signUp = signUp;

var dbPool = require('./common').dbPool;
var jwt = require('./jwt');
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

//회원탈퇴
function withdraw(withdrawInfo, callback) {
  var sql_withdraw = 'update member set available = 0 where member_id = ? and available = 1';
  dbPool.getConnection( function(error,dbConn) {
    if(error){
      return callback(error);
    }
    var withdrawMessage = {};
    dbConn.query(sql_withdraw, [jwt.decodeToken(withdrawInfo.member_token).member_id], function(error,rows){
      if (error) {
        dbConn.release();
        return callback(error);
      }
      else {
          dbConn.release();
          withdrawMessage = { message : "withdraw success"};
          return callback(null, withdrawMessage);
      }
    });
  });
}

// 로그인 처리 함수
function logIn (logInInfo, callback) {
    var sql_login_check = 'select member_id, member_name, member_email, member_pwd from member where member_email = ? and member_pwd = ? and available = 1';
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
                var logInMessage =
                {
                    message : "login success",
                    member_token : jwt.makeToken(rows[0])
                };
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
// 회원가입 중복확인 후 가입 처리를 해주는 함수
// async 사용
function signUp (signUpInfo, callback) {
    var sql_repetition = 'select * from member where member_email = ? or member_name = ?';
    var sql_insert_member = 'insert into member(member_name, member_email, member_pwd) values (?, ?, ?)';
    dbPool.getConnection ( function (error, dbConn) {
        if (error) {
            return callback(error);
        }

        var signUpMessage = {};
        var isRepetition = false;
        async.series([checkRepetition, completeSignUp], function (error, results) {
            if (error) {
                dbConn.release();
                return callback(error);
            }
            dbConn.release();
            return callback(null, signUpMessage);
        });
        // 중복 확인 함수
        function checkRepetition (done) {
            dbConn.query(sql_repetition, [signUpInfo.member_email, signUpInfo.member_name], function (error, rows) {
                if (error) {
                    return done(error);
                }
                else if (rows.length > 0) {
                    signUpMessage = {message : "repetition" };
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
                signUpMessage = { message : "create" };
                return done(null);
            });
        }
    });
}

function checkVersion (callback) {
    var ver_sql = 'select ver from connection';
    dbPool.getConnection( function (error, dbConn) {
        if (error) {
            return callback(error);
        }

        var checkVerMessage = {};
        dbConn.query(ver_sql, function (error, rows) {
            if (error) {
                dbConn.release();
                return callback(error);
            }

            else {
                dbConn.release();
                checkVerMessage = { version : rows[0].ver };
                return callback(null, checkVerMessage);
            }
        });
    });
}

function verify (verifyInfo, callback) {
    var sql_verify = 'select member_id from member where member_id = ?';
    dbPool.getConnection ( function (error, dbConn) {
        if (error) {
            return callback(error);
        }

        var verifyMessage = {};
        if (!verifyInfo.member_token) {
            dbConn.release();
            verifyMessage = {message : "is not logined"};
            return callback(null, verifyMessage);
        }

        dbConn.query(sql_verify, [jwt.decodeToken(verifyInfo.member_token).member_id], function (error, rows) {
            if (error) {
                dbConn.release();
                return callback(error);
            }
            else if (rows.length == 0) {
                dbConn.release();
                verifyMessage = {message : "is not logined"};
                return callback(null, verifyMessage);
            }
            else {
                dbConn.release();
                verifyMessage = {message : "is logined"};
                return callback(null, verifyMessage);
            }
        });
    });
}
module.exports.logIn = logIn;
module.exports.signUp = signUp;
module.exports.checkVersion = checkVersion;
module.exports.withdraw = withdraw;
module.exports.verify = verify;

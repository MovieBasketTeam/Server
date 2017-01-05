var dbPool = require('./common').dbPool;
var jwt = require('./jwt');
var fs = require('fs');
var async = require('async');
var crypto = require('crypto');
var logger = require('./winston').logger;
var awsinfo_config = require('../config/awsinfo_config.json');
var server_error = {message : "internal server error"};

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

// 1-a 로그인 처리 함수
function logIn (logInInfo, callback) {
    var sql_login_check = 'select member_id, member_name, member_email, member_pwd, member_image from member where member_email = ? and member_pwd = ? and available = 1';
    dbPool.getConnection ( function (error, dbConn) {
        if (error) {
            logger.debug("In function logIn : Get Connection Error");
            return callback(error);
        }

        var logInMessage = {};
        dbConn.query(sql_login_check, [logInInfo.member_email, cipherPassword(logInInfo.member_pwd)], function (error, rows) {
            if (error) {
                logger.debug("In function logIn : db Connection query error\n. query is : "+sql_login_check+"");
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
                logger.debug("member email : "+logInInfo.member_email+" is logined.");
                return callback(null, logInMessage);
            }
            // 아이디 혹은 비밀번호가 잘못됨 혹은 탈퇴된 회원
            else {
                dbConn.release();
                logger.debug('member email : '+logInInfo.member_email+' - check information.');
                logInMessage = { message : "check information"};
                return callback(null, logInMessage);
            }
        });
    });
}


// 1-b 회원가입 중복확인 후 가입 처리를 해주는 함수
// async 사용
function signUp (signUpInfo, callback) {
    var sql_repetition = 'select * from member where member_email = ? or member_name = ?';
    var sql_insert_member = 'insert into member(member_name, member_email, member_pwd) values (?, ?, ?)';
    var server_error = {message : "internal server error"};
    dbPool.getConnection ( function (error, dbConn) {
        if (error) {
            logger.debug("In function signUp , Get Connection Error");
            return callback(server_error);
        }

        var signUpMessage = {};
        var isRepetition = false;
        async.series([checkRepetition, completeSignUp], function (error, results) {
            if (error) {
                dbConn.release();
                return callback(server_error);
            }
            dbConn.release();
            return callback(null, signUpMessage);
        });
        // 중복 확인 함수
        function checkRepetition (done) {
            dbConn.query(sql_repetition, [signUpInfo.member_email, signUpInfo.member_name], function (error, rows) {
                if (error) {
                    logger.debug("In function checkRepetition , query error : "+sql_repetition);
                    return done(server_error);
                }
                else if (rows.length > 0) {
                    logger.debug("email : "+signUpInfo.member_email+" or name : " + signUpInfo.member_name +" has repetition");
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
                    logger.debug("In function completeSignUp , query error : "+sql_insert_member);
                    return done(server_error);
                }
                logger.debug("Complete Sign Up, email : "+signUpInfo.member_email+"name : "+signUpInfo.member_name);
                signUpMessage = { message : "create" };
                return done(null);
            });
        }
    });
}

// 1-c 회원탈퇴 함수
function withdraw(withdrawInfo, callback) {
    var sql_withdraw = 'update member set available = 0 where member_id = ? and available = 1';
    dbPool.getConnection( function(error,dbConn) {
        if(error){
            logger.debug("In function withdraw, Get Connection Error");
            return callback(error);
        }

        var withdrawMessage = {};
        if (withdrawInfo.member_token =='') {
            dbConn.release();
            withdrawMessage = {message : "is not logined"};
            return callback(null, withdrawMessage);
        }

        dbConn.query(sql_withdraw, [jwt.decodeToken(withdrawInfo.member_token).member_id], function(error,rows){
            if (error) {
                logger.debug("In function withdraw, query error : "+sql_withdraw);
                dbConn.release();
                return callback({message : "withdraw failed"});
            }
            else {
                dbConn.release();
                logger.debug("withdraw success , email : "+jwt.decodeToken(withdrawInfo.member_token).member_email);
                withdrawMessage = { message : "withdraw success"};
                return callback(null, withdrawMessage);
            }
        });
    });
}

// 1-d 버전확인 함수
function checkVersion (callback) {
    var ver_sql = 'select ver from connection';
    dbPool.getConnection( function (error, dbConn) {
        if (error) {
            return callback(error);
        }

        var checkVerMessage = {};
        dbConn.query(ver_sql, function (error, rows) {
            if (error) {
                logger.debug("In function checkVersion, query error : "+ver_sql);
                dbConn.release();
                return callback({message : "version check failed"});
            }

            else {
                dbConn.release();
                logger.debug("In function checkVersion, version is : "+rows[0].ver);
                checkVerMessage = { version : rows[0].ver };
                return callback(null, checkVerMessage);
            }
        });
    });
}

// 1-e 로그인 상태 확인 함수
function verify (verifyInfo, callback) {
    var sql_verify = 'select member_id from member where member_id = ?';
    dbPool.getConnection ( function (error, dbConn) {
        if (error) {
            logger.debug("In function verify, Get Connection Error");
            return callback(error);
        }

        var verifyMessage = {};
        if (verifyInfo.member_token =='') {
            dbConn.release();
            logger.debug("In function verify, token is none, member is not logined");
            verifyMessage = {message : "is not logined"};
            return callback(null, verifyMessage);
        }
        var decodedToken = jwt.decodeToken(verifyInfo.member_token);
        dbConn.query(sql_verify, [decodedToken.member_id], function (error, rows) {
            if (error) {
                logger.debug("In function verify, query error : "+sql_verify);
                dbConn.release();
                return callback(error);
            }
            else if (rows.length == 0) {
                dbConn.release();
                logger.debug("In function verify, token is none, member is not logined");
                verifyMessage = {message : "is not logined"};
                return callback(null, verifyMessage);
            }
            else {
                dbConn.release();
                logger.debug("email : "+decodedToken.member_email+" is logined");
                verifyMessage = {message : "is logined"};
                return callback(null, verifyMessage);
            }
        });
    });
}

// 1-f 프로필 사진 등록 함수
function uploadProfile (info, callback) {
    var sql_update_member = 'update member set member_image = ? where member_id = ?';
    var sql_member_info = 'select member_id, member_name, member_email, member_pwd, member_image from member where member_id = ?';
    dbPool.getConnection( function (error, dbConn) {
        if (error) {
            logger.debug("In function uploadProfile, Get Connection Error");
            return callback(server_error);
        }

        var sendMessage = {};
        if (info.member_token =='') {
            dbConn.release();
            logger.debug("In function uploadProfile, token is none, member is not logined");
            sendMessage = {message : "is not logined"};
            return callback(null, sendMessage);
        }

        if (!info.file) {
            dbConn.release();
            logger.debug("In function uploadProfile, request file is null");
            sendMessage = {message : "request file is null"};
            return callback(sendMessage);
        }

        var url = "http://"+awsinfo_config.url+'/images/'+info.file.filename;
        async.series([uploadFile, deletePastFile, remakeToken], function (error, results) {
            if (error) {
                dbConn.release();
                return callback(server_error);
            }
            dbConn.release();
            logger.debug("In function uploadProfile, upload profile completed");
            return callback(null, sendMessage);
        });

        function uploadFile (done) {
            dbConn.query
            (
                sql_update_member,
                [url, jwt.decodeToken(info.member_token).member_id],
                function (error, rows) {
                    if (error) {
                        logger.debug("In function uploadProfile - uploadFile, query error : "+sql_update_member);
                        return done(server_error);
                    }

                    sendMessage = {message : "upload file success"};
                    return done(null);
                }
            );
        }

        function deletePastFile (done) {
            var image_url = jwt.decodeToken(info.member_token).member_image;
            if (image_url=='') {
                return done(null);
            }
            var url = './uploads/images'+image_url.substring(image_url.lastIndexOf('/'));
            fs.unlink(url, function (error) {
                if (error) {
                    logger.debug("In function uploadProfile - deletePastFile, Error : "+error);
                    return done(server_error);
                }
                return done(null);
            });
        }

        function remakeToken (done) {
            dbConn.query
            (
                sql_member_info,
                [jwt.decodeToken(info.member_token).member_id],
                function (error, rows) {
                    if (error) {
                        logger.debug("In function uploadProfile - remakeToken, query error : "+sql_member_info);
                        return done(server_error);
                    }
                    sendMessage.member_token = jwt.makeToken(rows[0]);
                    return done(null);
                }
            );
        }
    });
}

function deleteProfile (info, callback) {

    var sql_delete_profile ='update member set member_image = ? where member_id = ?';
    var sql_member_info = 'select member_id, member_name, member_email, member_pwd, member_image from member where member_id = ?';

    dbPool.getConnection(function (error, dbConn) {
        if (error) {
            return callback(error);
        }

        var sendMessage = {};
        if (info.member_token =='') {
            logger.debug("In function deleteProfile, token is none, member is not logined");
            sendMessage = {message : "is not logined"};
            dbConn.release();
            return callback(null, sendMessage);
        }

        async.series([deleteFile, deleteInDB, remakeToken], function (error, results) {
            if (error) {
                dbConn.release();
                return callback(server_error);
            }
            dbConn.release();
            logger.debug("In function deleteProfile, delete profile completed");
            return callback(null, sendMessage);
        });
        function deleteFile (done) {
            var image_url = jwt.decodeToken(info.member_token).member_image;
            var url = './uploads/images'+image_url.substring(image_url.lastIndexOf('/'));
            fs.unlink(url, function (error) {
                if (error) {
                    logger.debug("In function deleteProfile - deleteFile, Error : "+error);
                    return done(server_error);
                }
                return done(null);
            });
        }

        function deleteInDB (done) {
            dbConn.query
            (
                sql_delete_profile,
                ['', jwt.decodeToken(info.member_token).member_id],
                function (error, rows) {
                    if (error) {
                        logger.debug("In function deleteProfile - deleteInDB, query error : "+sql_delete_profile);
                        return done(server_error);
                    }

                    sendMessage = {message : "delete file success"};
                    return done(null);
                }
            );
        }

        function remakeToken (done) {
            dbConn.query
            (
                sql_member_info,
                [jwt.decodeToken(info.member_token).member_id],
                function (error, rows) {
                    if (error) {
                        logger.debug("In function deleteProfile - deleteInDB, query error : "+sql_member_info);
                        return done(server_error);
                    }
                    sendMessage.member_token = jwt.makeToken(rows[0]);
                    return done(null);
                }
            );
        }
    });
}
module.exports.logIn = logIn;
module.exports.signUp = signUp;
module.exports.checkVersion = checkVersion;
module.exports.withdraw = withdraw;
module.exports.verify = verify;
module.exports.uploadProfile = uploadProfile;
module.exports.deleteProfile = deleteProfile;

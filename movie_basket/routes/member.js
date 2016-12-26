var express = require('express');
var mysql = require('mysql');
var db_config = require('../config/db_config.json');
var crypto = require('crypto');
var router = express.Router();

// 암호화 함수 password 를 넣으면 암호화된 password 값을 리턴.
function cipherPassword (password) {
    var cipher = crypto.createCipher('aes256', 'password');
    cipher.update(password, 'ascii', 'hex');
    var cipherd = cipher.final('hex');
    return cipherd;
}

// 복호화 함수 암호화된 password를 넣으면 원래 password 값을 리턴.
function decipherPassword (password) {
    var decipher = crypto.createDecipher('aes256', 'password');
    decipher.update(password, 'hex', 'ascii');
    var decipherd = decipher.final('ascii');
    return decipherd;
}

// db_config 정보 활용하여 pool 생성
var pool = mysql.createPool({
    host : db_config.host,
    port : db_config.port,
    user : db_config.user,
    password : db_config.password,
    database : db_config.database,
    connectionLimit : db_config.connectionLimit
});

router.get('/', function (req, res, next) {
    res.send(200);
});
// 회원가입으로 '/' 경로로 post 방식 요청 처리
router.post('/', function (req, res, next) {
    console.log(req.body);
    pool.getConnection( function (error, connection) {
        if (error) {
            console.log("get connection error " + error);
            res.sendStatus(500);
            connection.release();
        }
        else {
            // 중복된 정보가 있는지 select 문으로 확인한다. 중복된 정보가 있다면 rows의 length 가 0보다 크고 그때 처리를 해준다.
            var repQuery = 'select * from member where member_name = ? or member_email = ?';
            connection.query(repQuery, [req.body.member_name, req.body.member_email], function (error, rows) {
                if (error) {
                    console.log("connection error " + error);
                    res.sendStatus(500);
                    connection.release();
                }
                else if (rows.length > 0){
                    // 중복 처리
                    res.status(201).send({result : 'repitition'});
                    connection.release();
                }
                // 중복된 값이 없는 경우 테이블에 회원 정보를 추가해준다.
                else {
                    connection.release();
                    pool.getConnection( function (error, connection) {
                        if (error) {
                            console.log("get connection error " + error);
                            res.sendStatus(500);
                            connection.release();
                        }
                        else {
                            var insertQuery = 'insert into member(member_name, member_email, member_pwd) values (?, ?, ?)';
                            console.log("req body member_pwd : "[req.body.member_name, req.body.member_email]);
                            var inserts = [req.body.member_name, req.body.member_email, cipherPassword(req.body.member_pwd)];
                            connection.query(insertQuery, inserts, function (error, rows) {
                                if (error) {
                                    console.log("connection error " + error);
                                    res.sendStatus(500);
                                    connection.release();
                                }
                                else {
                                    // 성공적으로 table에 추가되었음을 알림
                                    res.status(201).send({result : 'create'});
                                    connection.release();
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;

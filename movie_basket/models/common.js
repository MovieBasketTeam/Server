var mysql = require('mysql');
var db_config = require('../config/db_config.json');

var dbPool = mysql.createPool({
    host : db_config.host,
    port : db_config.port,
    user : db_config.user,
    password : db_config.password,
    database : db_config.database,
    connectionLimit : db_config.connectionLimit
});


module.exports.dbPool = dbPool;

var winston = require('winston');
var warnLogger = new (winston.Logger) ({
    levels : {
        warn : 0
    },
    colors : {
        warn : 'yellow'
    },
    transports :
    [
        new (winston.transports.Console) ({
            level : 'warn',
            colorize : true
        })
    ]
});
var errLogger = new (winston.Logger) ({
    levels : {
        error : 0
    },
    colors : {
        error : 'red'
    },
    transports :
    [
        new (winston.transports.Console) ({
            level : 'error',
            colorize : true
        })
    ]
});
var logger = new (winston.Logger) ({
    levels : {
        debug : 5
    },
    colors: {
        debug : 'blue'
    },
    transports :
    [
        new (winston.transports.Console)(
            {
                level : 'debug',
                colorize : true
            })
    ]
});


module.exports.logger = logger;
module.exports.warnLogger = warnLogger;
module.exports.errLogger = errLogger;

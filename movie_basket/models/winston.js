var winston = require('winston');
winston.setLevels(winston.config.syslog.levels);
var logger = new (winston.Logger) ({
    transports: [
        new (winston.transports.Console)()
    ]
});
logger.setLevels(winston.config.syslog.levels);

module.exports.logger = logger;

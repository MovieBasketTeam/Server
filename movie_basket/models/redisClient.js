var redis = require('redis');

var redisClient = redis.createClient();

redisClient.on('error', function (error) {
    console.log('Redis error ' + error);
});

module.exports = redisClient;

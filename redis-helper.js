// This module handles shared redis client for all

var config = require('./config.json'),
    logger = require('./logger.js'),
    redis = require('redis'),
    redisClient;

logger.info('openHAB-cloud: Connecting to Redis at ' + config.redis.host + ':' + config.redis.port);

redisClient = redis.createClient(config.redis.port, config.redis.host);

if (typeof config.redis.password !== 'undefined') {
    redisClient.auth(config.redis.password, function (error, data) {
        if (error) {
            logger.error(error);
        } else {
            logger.info('openHAB-cloud: Redis connect response: ' + data);
        }
    });
}

redisClient.on('ready', function () {
    logger.info('openHAB-cloud: Redis is ready');
});

redisClient.on('end', function () {
    logger.error('openHAB-cloud: Redis error: connection is closed');
});

redisClient.on('error', function (error) {
    logger.error('openHAB-cloud: Redis error: ' + error);
});

module.exports = redisClient;

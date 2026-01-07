const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-13560.crce263.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 13560
    }
});


redisClient.on("error", (err) => console.error("Redis error", err));

module.exports = redisClient;


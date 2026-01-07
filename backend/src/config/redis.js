const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST, // Add this to your .env
        port: process.env.REDIS_PORT  // Add this to your .env
    }
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

module.exports = redisClient;

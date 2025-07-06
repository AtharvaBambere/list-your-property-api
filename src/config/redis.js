const Redis = require('ioredis');
const config = require('./config');

let redisClient;

const connectRedis = async () => {
  try {
    // Create ioredis client with Redis Cloud URL
    redisClient = new Redis(config.REDIS_URL);

    redisClient.on('error', (error) => {
      console.error(`Redis Error: ${error}`);
    });

    redisClient.on('connect', () => {
      console.log('Redis connected successfully');
    });

    return redisClient;
  } catch (error) {
    console.error(`Error connecting to Redis: ${error.message}`);
    return null;
  }
};

const getRedisClient = () => {
  return redisClient;
};

module.exports = {
  connectRedis,
  getRedisClient
}; 
const { getRedisClient } = require('../config/redis');
const config = require('../config/config');

/**
 * Cache middleware - checks if data exists in cache before proceeding
 * @param {string} key - The key to use for caching (can be a function that returns a string)
 * @returns {Function} Express middleware
 */
exports.cacheMiddleware = (key) => async (req, res, next) => {
  try {
    const redisClient = getRedisClient();
    if (!redisClient || redisClient.status !== 'ready') {
      return next();
    }
    const cacheKey = typeof key === 'function' 
      ? key(req) 
      : key || `${req.originalUrl}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }
    const originalSend = res.send;
    res.send = function(body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          redisClient.setex(
            cacheKey,
            config.CACHE_TTL,
            typeof body === 'string' ? body : JSON.stringify(body)
          );
        } catch (error) {
          console.error('Redis caching error:', error);
        }
      }
      originalSend.call(this, body);
    };

    next();
  } catch (error) {
    console.error('Cache middleware error:', error);
    next();
  }
};

/**
 * Clear cache for specific patterns
 * @param {string|Array} patterns - Pattern(s) to clear
 * @returns {Function} Express middleware
 */
exports.clearCache = (patterns) => async (req, res, next) => {
  try {
    const redisClient = getRedisClient();
    if (!redisClient || redisClient.status !== 'ready') {
      return next();
    }
    const patternArray = Array.isArray(patterns) ? patterns : [patterns];
    for (const pattern of patternArray) {
      const keys = await redisClient.keys(pattern);
      
      if (keys.length > 0) {
        await redisClient.unlink(keys);
      }
    }

    next();
  } catch (error) {
    console.error('Clear cache error:', error);
    next();
  }
}; 
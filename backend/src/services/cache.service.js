import { redisClient } from '../config/redis.js';
import { logger } from '../logger/index.js';
import { ApiError } from '../exceptions/ApiError.js';

export const CacheService = {
  async get(key) {
    try {
      const data = await redisClient.get(key);
      if (data === null) return null;
      return JSON.parse(data);
    } catch (err) {
      logger.error({ err, key }, 'Cache get error');
      throw ApiError.internal(`Cache get failed for key: ${key}`);
    }
  },

  async set(key, value, ttl = 3600) {
    try {
      const serialized = JSON.stringify(value);
      await redisClient.set(key, serialized, 'EX', ttl);
    } catch (err) {
      logger.error({ err, key }, 'Cache set error');
      throw ApiError.internal(`Cache set failed for key: ${key}`);
    }
  },

  async delete(key) {
    try {
      await redisClient.del(key);
    } catch (err) {
      logger.error({ err, key }, 'Cache delete error');
      throw ApiError.internal(`Cache delete failed for key: ${key}`);
    }
  },

  async deletePattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (err) {
      logger.error({ err, pattern }, 'Cache deletePattern error');
      throw ApiError.internal(`Cache deletePattern failed for pattern: ${pattern}`);
    }
  },

  async exists(key) {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (err) {
      logger.error({ err, key }, 'Cache exists error');
      throw ApiError.internal(`Cache exists failed for key: ${key}`);
    }
  },
};

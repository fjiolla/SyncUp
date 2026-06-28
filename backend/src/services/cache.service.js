import { redisClient } from '../config/redis.js';
import { logger } from '../logger/index.js';

/**
 * Cache layer that fails open: Redis is treated as a best-effort optimization,
 * never a hard dependency. On any Redis error we log and degrade gracefully
 * (reads miss, writes are skipped) so the request can still be served from the
 * source of truth instead of returning a 500.
 */
export const CacheService = {
  async get(key) {
    try {
      const data = await redisClient.get(key);
      if (data === null) return null;
      return JSON.parse(data);
    } catch (err) {
      logger.error({ err, key }, 'Cache get error — falling back to source');
      return null;
    }
  },

  async set(key, value, ttl = 3600) {
    try {
      const serialized = JSON.stringify(value);
      await redisClient.set(key, serialized, 'EX', ttl);
    } catch (err) {
      logger.error({ err, key }, 'Cache set error — skipping cache write');
    }
  },

  async delete(key) {
    try {
      await redisClient.del(key);
    } catch (err) {
      logger.error({ err, key }, 'Cache delete error');
    }
  },

  async deletePattern(pattern) {
    try {
      // SCAN avoids the O(N) blocking behaviour of KEYS in production. We stream
      // matching keys in batches and delete them as we go.
      const stream = redisClient.scanStream({ match: pattern, count: 100 });
      const pending = [];

      for await (const keys of stream) {
        if (keys.length > 0) {
          pending.push(redisClient.del(...keys));
        }
      }

      await Promise.all(pending);
    } catch (err) {
      logger.error({ err, pattern }, 'Cache deletePattern error');
    }
  },

  async exists(key) {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (err) {
      logger.error({ err, key }, 'Cache exists error');
      return false;
    }
  },
};

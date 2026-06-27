import Redis from 'ioredis';
import { config } from './index.js';
import { logger } from '../logger/index.js';

const redisClient = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times) {
    if (times > 10) {
      logger.warn('Redis max reconnection attempts (10) reached');
      return null;
    }
    const delay = Math.min(times * 200, 5000);
    return delay;
  },
  lazyConnect: false,
});

redisClient.on('connect', () => {
  logger.info('Redis connected');
});

redisClient.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

redisClient.on('close', () => {
  logger.warn('Redis connection closed');
});

export { redisClient };

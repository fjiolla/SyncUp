import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { config } from '../config/index.js';
import { redisClient } from '../config/redis.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';

const handler = (req, res) => {
  ResponseFormatter.error(res, {
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: 'Too many requests, please try again later',
    errors: null,
  });
};

// A shared Redis store keeps rate-limit counters consistent across multiple
// backend instances/processes behind a load balancer. Each limiter uses its own
// key prefix so their counters don't collide.
const createStore = (prefix) =>
  new RedisStore({
    prefix,
    sendCommand: (...args) => redisClient.call(...args),
  });

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: true,
  handler,
  skip: (req) => req.method === 'OPTIONS',
  store: createStore('rl:global:'),
});

// Stricter limiter for sensitive auth endpoints (login, register, password reset)
// to slow credential-stuffing and brute-force attempts.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: true,
  handler,
  skip: (req) => req.method === 'OPTIONS',
  store: createStore('rl:auth:'),
});

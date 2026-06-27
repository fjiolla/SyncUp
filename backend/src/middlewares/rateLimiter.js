import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';

const handler = (req, res) => {
  ResponseFormatter.error(res, {
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: 'Too many requests, please try again later',
    errors: null,
  });
};

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: true,
  handler,
  skip: (req) => req.method === 'OPTIONS',
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: true,
  handler,
  skip: (req) => req.method === 'OPTIONS',
});

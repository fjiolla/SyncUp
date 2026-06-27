import mongoose from 'mongoose';
import { redisClient } from '../config/redis.js';
import { config } from '../config/index.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const getHealth = asyncHandler(async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redisStatus = redisClient.status === 'ready' ? 'connected' : 'disconnected';
  const allConnected = mongoStatus === 'connected' && redisStatus === 'connected';
  const statusCode = allConnected ? 200 : 503;

  ResponseFormatter.success(res, {
    statusCode,
    message: 'Health check',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: config.server.nodeEnv,
      dependencies: {
        mongodb: mongoStatus,
        redis: redisStatus,
      },
    },
  });
});

import app from './app.js';
import { config } from './config/index.js';
import { connectDatabase } from './config/database.js';
import { redisClient } from './config/redis.js';
import { logger } from './logger/index.js';
import { registerUnhandledRejectionHandler } from './middlewares/errorHandler.js';
import { PodRepository } from './repositories/pod.repository.js';
import mongoose from 'mongoose';

registerUnhandledRejectionHandler();

const SHUTDOWN_TIMEOUT_MS = 10000;
const EXPIRY_SWEEP_INTERVAL_MS = 5 * 60 * 1000;

async function sweepExpiredPods() {
  try {
    const count = await PodRepository.markEndedAsCompleted();
    if (count > 0) logger.info(`Marked ${count} ended activities as completed`);
  } catch (err) {
    logger.error({ err }, 'Failed to sweep expired activities');
  }
}

async function startServer() {
  await connectDatabase();

  const server = app.listen(config.server.port, () => {
    logger.info(`Server listening on port ${config.server.port} in ${config.server.nodeEnv} mode`);
  });

  await sweepExpiredPods();
  const expirySweep = setInterval(sweepExpiredPods, EXPIRY_SWEEP_INTERVAL_MS);
  expirySweep.unref();

  const shutdown = async (signal) => {
    logger.info(`${signal} received — starting graceful shutdown`);

    clearInterval(expirySweep);

    const forceTimeout = setTimeout(() => {
      logger.error('Graceful shutdown timed out — force terminating');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceTimeout.unref();

    try {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      logger.info('HTTP server closed');

      await mongoose.disconnect();
      logger.info('MongoDB disconnected');

      await redisClient.quit();
      logger.info('Redis disconnected');

      logger.info('Process exiting');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();

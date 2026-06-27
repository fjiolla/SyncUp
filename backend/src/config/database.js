import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { logger } from '../logger/index.js';

const CONNECTION_TIMEOUT_MS = 45000;

export const connectDatabase = async () => {
  const isProduction = config.server.nodeEnv === 'production';

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected successfully');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error');
  });

  const timeoutId = setTimeout(() => {
    logger.error(
      `MongoDB connection timeout: failed to connect within ${CONNECTION_TIMEOUT_MS / 1000} seconds`
    );
    process.exit(1);
  }, CONNECTION_TIMEOUT_MS);

  try {
    await mongoose.connect(config.database.uri, {
      autoIndex: !isProduction,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 50,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
      family: 4,
    });
    clearTimeout(timeoutId);
  } catch (err) {
    clearTimeout(timeoutId);
    logger.error({ err }, 'MongoDB connection failed');
    process.exit(1);
  }
};

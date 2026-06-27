import { ApiError } from '../exceptions/ApiError.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';
import { logger } from '../logger/index.js';
import { config } from '../config/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

function convertMongooseError(err) {
  if (err.name === 'ValidationError') {
    const fieldErrors = Object.entries(err.errors).map(([field, detail]) => ({
      field,
      message: detail.message,
    }));
    return ApiError.badRequest('Validation failed', fieldErrors);
  }

  if (err.name === 'CastError') {
    const message = `Invalid value for ${err.path}: ${err.value}`;
    return ApiError.badRequest(message);
  }

  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {}).join(', ');
    const message = fields
      ? `Duplicate value for: ${fields}`
      : 'Duplicate key error';
    return ApiError.conflict(message);
  }

  return err;
}

export const errorHandler = (err, req, res, next) => {
  const error = convertMongooseError(err);
  const isOperational = error instanceof ApiError && error.isOperational === true;

  if (isOperational) {
    logger.warn({ err: error, req }, error.message);
    return ResponseFormatter.error(res, {
      statusCode: error.statusCode,
      message: error.message,
      errors: error.errors.length > 0 ? error.errors : null,
    });
  }

  const isProduction = config.server.nodeEnv === 'production';
  logger.error({ err: error, req }, error.message || 'Unexpected error');

  if (isProduction) {
    return ResponseFormatter.error(res, {
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    });
  }

  return ResponseFormatter.error(res, {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: error.message || 'Internal Server Error',
    errors: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  });
};

export const registerUnhandledRejectionHandler = () => {
  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
  });
};

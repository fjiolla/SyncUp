import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export class ApiError extends Error {
  constructor(statusCode, message, { errorCode, isOperational = true, errors = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors = []) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, {
      errorCode: errors.length > 0 ? ERROR_CODES.VALIDATION_ERROR : ERROR_CODES.BAD_REQUEST,
      errors,
    });
  }

  static unauthorized(message) {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message, {
      errorCode: ERROR_CODES.UNAUTHORIZED,
    });
  }

  static forbidden(message) {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message, {
      errorCode: ERROR_CODES.FORBIDDEN,
    });
  }

  static notFound(message) {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message, {
      errorCode: ERROR_CODES.NOT_FOUND,
    });
  }

  static conflict(message) {
    return new ApiError(HTTP_STATUS.CONFLICT, message, {
      errorCode: ERROR_CODES.CONFLICT,
    });
  }

  static tooManyRequests(message) {
    return new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, message, {
      errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    });
  }

  static internal(message) {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, {
      errorCode: ERROR_CODES.INTERNAL_ERROR,
      isOperational: false,
    });
  }
}

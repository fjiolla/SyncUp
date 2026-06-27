import { describe, it, expect } from 'vitest';
import { ApiError } from '../../../src/exceptions/ApiError.js';
import { HTTP_STATUS } from '../../../src/constants/httpStatus.js';
import { ERROR_CODES } from '../../../src/constants/errorCodes.js';

describe('ApiError', () => {
  describe('constructor', () => {
    it('should extend native Error', () => {
      const error = new ApiError(400, 'Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
    });

    it('should set statusCode, message, and name correctly', () => {
      const error = new ApiError(404, 'Not found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.name).toBe('ApiError');
    });

    it('should default isOperational to true', () => {
      const error = new ApiError(400, 'Bad request');
      expect(error.isOperational).toBe(true);
    });

    it('should default errors to an empty array', () => {
      const error = new ApiError(400, 'Bad request');
      expect(error.errors).toEqual([]);
    });

    it('should accept custom errorCode', () => {
      const error = new ApiError(400, 'Validation failed', {
        errorCode: ERROR_CODES.VALIDATION_ERROR,
      });
      expect(error.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should accept isOperational override', () => {
      const error = new ApiError(500, 'Server crash', { isOperational: false });
      expect(error.isOperational).toBe(false);
    });

    it('should accept field-level errors', () => {
      const fieldErrors = [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password too short' },
      ];
      const error = new ApiError(400, 'Validation failed', { errors: fieldErrors });
      expect(error.errors).toEqual(fieldErrors);
      expect(error.errors).toHaveLength(2);
    });

    it('should have a stack trace', () => {
      const error = new ApiError(500, 'Internal error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ApiError');
    });
  });

  describe('static badRequest()', () => {
    it('should create a 400 error with BAD_REQUEST code when no field errors', () => {
      const error = ApiError.badRequest('Invalid input');
      expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(error.message).toBe('Invalid input');
      expect(error.errorCode).toBe(ERROR_CODES.BAD_REQUEST);
      expect(error.isOperational).toBe(true);
      expect(error.errors).toEqual([]);
    });

    it('should use VALIDATION_ERROR code when field errors are provided', () => {
      const fieldErrors = [{ field: 'name', message: 'Name is required' }];
      const error = ApiError.badRequest('Validation failed', fieldErrors);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe(ERROR_CODES.VALIDATION_ERROR);
      expect(error.errors).toEqual(fieldErrors);
    });
  });

  describe('static unauthorized()', () => {
    it('should create a 401 error', () => {
      const error = ApiError.unauthorized('Please log in');
      expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(error.message).toBe('Please log in');
      expect(error.errorCode).toBe(ERROR_CODES.UNAUTHORIZED);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('static forbidden()', () => {
    it('should create a 403 error', () => {
      const error = ApiError.forbidden('Access denied');
      expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
      expect(error.message).toBe('Access denied');
      expect(error.errorCode).toBe(ERROR_CODES.FORBIDDEN);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('static notFound()', () => {
    it('should create a 404 error', () => {
      const error = ApiError.notFound('User not found');
      expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
      expect(error.message).toBe('User not found');
      expect(error.errorCode).toBe(ERROR_CODES.NOT_FOUND);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('static conflict()', () => {
    it('should create a 409 error', () => {
      const error = ApiError.conflict('Email already exists');
      expect(error.statusCode).toBe(HTTP_STATUS.CONFLICT);
      expect(error.message).toBe('Email already exists');
      expect(error.errorCode).toBe(ERROR_CODES.CONFLICT);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('static tooManyRequests()', () => {
    it('should create a 429 error', () => {
      const error = ApiError.tooManyRequests('Rate limit exceeded');
      expect(error.statusCode).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.errorCode).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('static internal()', () => {
    it('should create a 500 error with isOperational false', () => {
      const error = ApiError.internal('Something went wrong');
      expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(error.message).toBe('Something went wrong');
      expect(error.errorCode).toBe(ERROR_CODES.INTERNAL_ERROR);
      expect(error.isOperational).toBe(false);
    });
  });
});

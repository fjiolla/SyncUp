import { vi, describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';

// Mock the config module - must be before importing errorHandler
vi.mock('../../../src/config/index.js', () => ({
  config: { server: { nodeEnv: 'development' } },
}));

// Mock the logger module
vi.mock('../../../src/logger/index.js', () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import { errorHandler } from '../../../src/middlewares/errorHandler.js';
import { ApiError } from '../../../src/exceptions/ApiError.js';

/**
 * Creates a mock Express response object with chainable status/json.
 */
function createMockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

/**
 * Creates a minimal mock Express request object.
 */
function createMockReq() {
  return { method: 'GET', url: '/test', headers: {} };
}

describe('Error Handler Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Validates: Requirements 11.4, 11.8**
   *
   * Property 8: Error classification — operational vs programming
   * ApiError with isOperational=true is operational; all others are non-operational
   */
  describe('Property 8: Error classification — operational vs programming', () => {
    it('ApiError with isOperational=true responds with the error statusCode', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 400, max: 599 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (statusCode, message) => {
            const error = new ApiError(statusCode, message, { isOperational: true });
            const req = createMockReq();
            const res = createMockRes();
            const next = vi.fn();

            errorHandler(error, req, res, next);

            // Should respond with the ApiError's statusCode (operational error)
            expect(res.status).toHaveBeenCalledWith(statusCode);
            const jsonBody = res.json.mock.calls[0][0];
            expect(jsonBody.success).toBe(false);
            expect(jsonBody.message).toBe(message);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('plain Errors are treated as non-operational and respond with 500', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.constantFrom('Error', 'TypeError', 'RangeError'),
          (message, errorType) => {
            let error;
            switch (errorType) {
              case 'TypeError':
                error = new TypeError(message);
                break;
              case 'RangeError':
                error = new RangeError(message);
                break;
              default:
                error = new Error(message);
            }

            const req = createMockReq();
            const res = createMockRes();
            const next = vi.fn();

            errorHandler(error, req, res, next);

            // Non-operational errors should always respond with 500
            expect(res.status).toHaveBeenCalledWith(500);
            const jsonBody = res.json.mock.calls[0][0];
            expect(jsonBody.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('ApiError with isOperational=false is treated as non-operational (500)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 400, max: 599 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (statusCode, message) => {
            const error = new ApiError(statusCode, message, { isOperational: false });
            const req = createMockReq();
            const res = createMockRes();
            const next = vi.fn();

            errorHandler(error, req, res, next);

            // Non-operational ApiError should respond with 500 regardless of statusCode
            expect(res.status).toHaveBeenCalledWith(500);
            const jsonBody = res.json.mock.calls[0][0];
            expect(jsonBody.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Validates: Requirements 11.4, 11.8**
   *
   * Property 9: Mongoose error conversion
   * ValidationError with N fields → ApiError 400 with N entries; CastError → 400; duplicate key → 409
   */
  describe('Property 9: Mongoose error conversion', () => {
    it('Mongoose ValidationError with N fields produces ApiError 400 with N error entries', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (numFields) => {
            // Create a mock Mongoose ValidationError with N fields
            const errors = {};
            for (let i = 0; i < numFields; i++) {
              const fieldName = `field${i}`;
              errors[fieldName] = { message: `${fieldName} is invalid` };
            }

            const validationError = new Error('Validation failed');
            validationError.name = 'ValidationError';
            validationError.errors = errors;

            const req = createMockReq();
            const res = createMockRes();
            const next = vi.fn();

            errorHandler(validationError, req, res, next);

            // Should respond with 400
            expect(res.status).toHaveBeenCalledWith(400);
            const jsonBody = res.json.mock.calls[0][0];
            expect(jsonBody.success).toBe(false);
            expect(jsonBody.message).toBe('Validation failed');
            // Should have exactly N error entries
            expect(jsonBody.errors).toHaveLength(numFields);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Mongoose CastError produces ApiError 400', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          (path, value) => {
            const castError = new Error(`Cast failed`);
            castError.name = 'CastError';
            castError.path = path;
            castError.value = value;

            const req = createMockReq();
            const res = createMockRes();
            const next = vi.fn();

            errorHandler(castError, req, res, next);

            // Should respond with 400
            expect(res.status).toHaveBeenCalledWith(400);
            const jsonBody = res.json.mock.calls[0][0];
            expect(jsonBody.success).toBe(false);
            expect(jsonBody.message).toContain(path);
            expect(jsonBody.message).toContain(value);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('MongoDB duplicate key error (code 11000) produces ApiError 409', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          (field, value) => {
            const duplicateError = new Error('Duplicate key');
            duplicateError.code = 11000;
            duplicateError.keyValue = { [field]: value };

            const req = createMockReq();
            const res = createMockRes();
            const next = vi.fn();

            errorHandler(duplicateError, req, res, next);

            // Should respond with 409
            expect(res.status).toHaveBeenCalledWith(409);
            const jsonBody = res.json.mock.calls[0][0];
            expect(jsonBody.success).toBe(false);
            expect(jsonBody.message).toContain(field);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

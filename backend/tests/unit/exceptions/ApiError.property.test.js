import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ApiError } from '../../../src/exceptions/ApiError.js';

/**
 * Property 7: ApiError construction invariants
 * **Validates: Requirements 11.1**
 *
 * For any statusCode in [400,599], non-empty message, and errorCode,
 * the instance has correct properties and isOperational defaults to true.
 */
describe('ApiError property tests', () => {
  it('Property 7: construction invariants hold for any valid inputs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 400, max: 599 }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (statusCode, message, errorCode) => {
          const error = new ApiError(statusCode, message, { errorCode });

          // instance is instanceof Error
          expect(error).toBeInstanceOf(Error);

          // instance is instanceof ApiError
          expect(error).toBeInstanceOf(ApiError);

          // statusCode matches
          expect(error.statusCode).toBe(statusCode);

          // message matches
          expect(error.message).toBe(message);

          // errorCode matches
          expect(error.errorCode).toBe(errorCode);

          // isOperational defaults to true (not explicitly specified)
          expect(error.isOperational).toBe(true);

          // errors defaults to []
          expect(error.errors).toEqual([]);

          // name === 'ApiError'
          expect(error.name).toBe('ApiError');

          // stack is defined
          expect(error.stack).toBeDefined();
        }
      ),
      { numRuns: 150 }
    );
  });
});

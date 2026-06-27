// Feature: syncup-backend-foundation, Property 10: AsyncHandler forwards rejections
// **Validates: Requirements 11.9**

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { asyncHandler } from '../../../src/middlewares/asyncHandler.js';

describe('Property 10: AsyncHandler forwards rejections', () => {
  it('for any async function that rejects with error E, wrapping it and invoking it calls next() with exactly E', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1 }), async (errorMessage) => {
        const error = new Error(errorMessage);
        const asyncFn = async () => {
          throw error;
        };
        const wrapped = asyncHandler(asyncFn);

        let nextCalledWith = null;
        const next = (err) => {
          nextCalledWith = err;
        };

        await wrapped({}, {}, next);

        expect(nextCalledWith).toBe(error);
      }),
      { numRuns: 100 }
    );
  });

  it('forwards non-Error rejection values to next()', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.string(),
          fc.integer(),
          fc.boolean(),
          fc.constant(null),
          fc.constant(undefined)
        ),
        async (rejectionValue) => {
          const asyncFn = async () => {
            throw rejectionValue;
          };
          const wrapped = asyncHandler(asyncFn);

          let nextCalled = false;
          let nextCalledWith;
          const next = (err) => {
            nextCalled = true;
            nextCalledWith = err;
          };

          await wrapped({}, {}, next);

          expect(nextCalled).toBe(true);
          expect(nextCalledWith).toBe(rejectionValue);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('does not call next() when async function resolves successfully', async () => {
    await fc.assert(
      fc.asyncProperty(fc.anything(), async (resolveValue) => {
        const asyncFn = async () => resolveValue;
        const wrapped = asyncHandler(asyncFn);

        let nextCalled = false;
        const next = () => {
          nextCalled = true;
        };

        await wrapped({}, {}, next);

        expect(nextCalled).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});

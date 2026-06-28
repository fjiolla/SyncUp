import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ResponseFormatter } from '../../../src/utils/responseFormatter.js';

/**
 * Helper: creates a mock Express response object.
 */
function createMockRes() {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
}

// Feature: Response Formatter
// Property 11: Response_Formatter envelope structure
// Validates: Requirements 12.1, 12.2, 12.4, 12.5, 12.6
describe('Property 11: Response_Formatter envelope structure', () => {
  it('success produces { success: true, message, data } with correct statusCode', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 599 }),
        fc.string({ minLength: 1 }),
        fc.oneof(fc.constant(null), fc.string(), fc.integer(), fc.array(fc.integer()), fc.dictionary(fc.string(), fc.string())),
        (statusCode, message, data) => {
          const res = createMockRes();
          ResponseFormatter.success(res, { statusCode, message, data });

          expect(res.statusCode).toBe(statusCode);
          expect(res.body).toEqual({ success: true, message, data });
        }
      ),
      { numRuns: 150 }
    );
  });

  it('error produces { success: false, message, errors } with correct statusCode', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 599 }),
        fc.string({ minLength: 1 }),
        fc.oneof(fc.constant(null), fc.string(), fc.array(fc.dictionary(fc.string(), fc.string()))),
        (statusCode, message, errors) => {
          const res = createMockRes();
          ResponseFormatter.error(res, { statusCode, message, errors });

          expect(res.statusCode).toBe(statusCode);
          expect(res.body).toEqual({ success: false, message, errors });
        }
      ),
      { numRuns: 150 }
    );
  });

  it('success defaults statusCode to 200', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.oneof(fc.constant(null), fc.string(), fc.integer()),
        (message, data) => {
          const res = createMockRes();
          ResponseFormatter.success(res, { message, data });

          expect(res.statusCode).toBe(200);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('error defaults statusCode to 500', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.oneof(fc.constant(null), fc.string(), fc.array(fc.string())),
        (message, errors) => {
          const res = createMockRes();
          ResponseFormatter.error(res, { message, errors });

          expect(res.statusCode).toBe(500);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: Response Formatter
// Property 12: Pagination metadata calculation
// Validates: Requirements 12.3, 12.6
describe('Property 12: Pagination metadata calculation', () => {
  it('totalPages = ceil(total/limit), hasNextPage = page < totalPages, hasPrevPage = page > 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 0, max: 100000 }),
        fc.string({ minLength: 1 }),
        fc.array(fc.anything()),
        (page, limit, total, message, data) => {
          const res = createMockRes();
          ResponseFormatter.paginated(res, {
            message,
            data,
            pagination: { page, limit, total },
          });

          const expectedTotalPages = Math.ceil(total / limit);
          const expectedHasNextPage = page < expectedTotalPages;
          const expectedHasPrevPage = page > 1;

          expect(res.statusCode).toBe(200);
          expect(res.body.success).toBe(true);
          expect(res.body.message).toBe(message);
          expect(res.body.data.results).toEqual(data);
          expect(res.body.data.pagination.page).toBe(page);
          expect(res.body.data.pagination.limit).toBe(limit);
          expect(res.body.data.pagination.total).toBe(total);
          expect(res.body.data.pagination.totalPages).toBe(expectedTotalPages);
          expect(res.body.data.pagination.hasNextPage).toBe(expectedHasNextPage);
          expect(res.body.data.pagination.hasPrevPage).toBe(expectedHasPrevPage);
        }
      ),
      { numRuns: 150 }
    );
  });
});

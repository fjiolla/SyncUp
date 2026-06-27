// Feature: syncup-backend-foundation, Property 14: Validation Layer reports all errors
// **Validates: Requirements 14.3, 14.4**

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import Joi from 'joi';
import { validate } from '../../../src/middlewares/validate.js';
import { ApiError } from '../../../src/exceptions/ApiError.js';

describe('Property 14: Validation Layer reports all errors', () => {
  it('for N schema violations in body, exactly N field-level error objects are reported with correct field path, message, and source "body"', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 8 }), (numFields) => {
        // Generate N distinct required fields
        const fields = Array.from({ length: numFields }, (_, i) => `field${i}`);

        // Create Joi schema requiring all fields
        const schemaObj = {};
        for (const field of fields) {
          schemaObj[field] = Joi.string().required();
        }

        const middleware = validate({ body: Joi.object(schemaObj) });
        const req = { body: {}, query: {}, params: {} };

        try {
          middleware(req, {}, () => {});
          // Should not reach here — validation must fail
          expect.unreachable('Middleware should have thrown');
        } catch (err) {
          expect(err).toBeInstanceOf(ApiError);
          expect(err.statusCode).toBe(400);
          expect(err.errors).toHaveLength(numFields);

          for (const fieldError of err.errors) {
            expect(fieldError.source).toBe('body');
            expect(fieldError.field).toBeTruthy();
            expect(fields).toContain(fieldError.field);
            expect(fieldError.message).toBeTruthy();
            expect(typeof fieldError.message).toBe('string');
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('for N schema violations in query, exactly N field-level error objects are reported with source "query"', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 8 }), (numFields) => {
        const fields = Array.from({ length: numFields }, (_, i) => `queryField${i}`);

        const schemaObj = {};
        for (const field of fields) {
          schemaObj[field] = Joi.string().required();
        }

        const middleware = validate({ query: Joi.object(schemaObj) });
        const req = { body: {}, query: {}, params: {} };

        try {
          middleware(req, {}, () => {});
          expect.unreachable('Middleware should have thrown');
        } catch (err) {
          expect(err).toBeInstanceOf(ApiError);
          expect(err.statusCode).toBe(400);
          expect(err.errors).toHaveLength(numFields);

          for (const fieldError of err.errors) {
            expect(fieldError.source).toBe('query');
            expect(fieldError.field).toBeTruthy();
            expect(fields).toContain(fieldError.field);
            expect(fieldError.message).toBeTruthy();
            expect(typeof fieldError.message).toBe('string');
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('for N schema violations in params, exactly N field-level error objects are reported with source "params"', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 8 }), (numFields) => {
        const fields = Array.from({ length: numFields }, (_, i) => `param${i}`);

        const schemaObj = {};
        for (const field of fields) {
          schemaObj[field] = Joi.string().required();
        }

        const middleware = validate({ params: Joi.object(schemaObj) });
        const req = { body: {}, query: {}, params: {} };

        try {
          middleware(req, {}, () => {});
          expect.unreachable('Middleware should have thrown');
        } catch (err) {
          expect(err).toBeInstanceOf(ApiError);
          expect(err.statusCode).toBe(400);
          expect(err.errors).toHaveLength(numFields);

          for (const fieldError of err.errors) {
            expect(fieldError.source).toBe('params');
            expect(fieldError.field).toBeTruthy();
            expect(fields).toContain(fieldError.field);
            expect(fieldError.message).toBeTruthy();
            expect(typeof fieldError.message).toBe('string');
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('for violations across multiple sources, the total error count equals the sum of all violations', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }),
        fc.integer({ min: 1, max: 4 }),
        fc.integer({ min: 1, max: 4 }),
        (numBody, numQuery, numParams) => {
          const bodyFields = Array.from({ length: numBody }, (_, i) => `bodyField${i}`);
          const queryFields = Array.from({ length: numQuery }, (_, i) => `queryField${i}`);
          const paramsFields = Array.from({ length: numParams }, (_, i) => `paramField${i}`);

          const bodySchema = {};
          for (const field of bodyFields) {
            bodySchema[field] = Joi.string().required();
          }

          const querySchema = {};
          for (const field of queryFields) {
            querySchema[field] = Joi.string().required();
          }

          const paramsSchema = {};
          for (const field of paramsFields) {
            paramsSchema[field] = Joi.string().required();
          }

          const middleware = validate({
            body: Joi.object(bodySchema),
            query: Joi.object(querySchema),
            params: Joi.object(paramsSchema),
          });
          const req = { body: {}, query: {}, params: {} };

          const expectedTotal = numBody + numQuery + numParams;

          try {
            middleware(req, {}, () => {});
            expect.unreachable('Middleware should have thrown');
          } catch (err) {
            expect(err).toBeInstanceOf(ApiError);
            expect(err.statusCode).toBe(400);
            expect(err.errors).toHaveLength(expectedTotal);

            const bodyErrors = err.errors.filter((e) => e.source === 'body');
            const queryErrors = err.errors.filter((e) => e.source === 'query');
            const paramsErrors = err.errors.filter((e) => e.source === 'params');

            expect(bodyErrors).toHaveLength(numBody);
            expect(queryErrors).toHaveLength(numQuery);
            expect(paramsErrors).toHaveLength(numParams);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

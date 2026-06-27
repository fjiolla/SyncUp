import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import pino from 'pino';
import { Writable } from 'stream';

/**
 * Property 4: Logger redaction of sensitive fields
 * For any request object with password/token/authorization/cookie fields,
 * serialized output replaces values with "[REDACTED]" while preserving non-sensitive fields.
 *
 * Validates: Requirements 7.4
 */

const redactPaths = [
  'password',
  'token',
  'authorization',
  'cookie',
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
  'req.body.token',
];

function createCaptureLogger() {
  const logs = [];
  const stream = new Writable({
    write(chunk, encoding, callback) {
      logs.push(JSON.parse(chunk.toString()));
      callback();
    },
  });

  const logger = pino(
    {
      level: 'info',
      redact: { paths: redactPaths, censor: '[REDACTED]' },
    },
    stream
  );

  return { logger, logs };
}

describe('Logger Redaction Property Test', () => {
  it('Property 4: sensitive fields are redacted while non-sensitive fields are preserved', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),  // sensitive value
        fc.string({ minLength: 1 }),  // non-sensitive value
        (sensitiveValue, normalValue) => {
          const { logger, logs } = createCaptureLogger();

          logger.info(
            {
              password: sensitiveValue,
              token: sensitiveValue,
              authorization: sensitiveValue,
              cookie: sensitiveValue,
              username: normalValue,
              email: normalValue,
            },
            'test message'
          );

          const logEntry = logs[0];

          // Sensitive fields must be redacted
          expect(logEntry.password).toBe('[REDACTED]');
          expect(logEntry.token).toBe('[REDACTED]');
          expect(logEntry.authorization).toBe('[REDACTED]');
          expect(logEntry.cookie).toBe('[REDACTED]');

          // Non-sensitive fields must be preserved
          expect(logEntry.username).toBe(normalValue);
          expect(logEntry.email).toBe(normalValue);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: nested sensitive fields in req object are redacted', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),  // sensitive value
        fc.string({ minLength: 1 }),  // non-sensitive value
        (sensitiveValue, normalValue) => {
          const { logger, logs } = createCaptureLogger();

          logger.info(
            {
              req: {
                headers: {
                  authorization: sensitiveValue,
                  cookie: sensitiveValue,
                  'content-type': normalValue,
                },
                body: {
                  password: sensitiveValue,
                  token: sensitiveValue,
                  username: normalValue,
                },
                method: normalValue,
              },
            },
            'request log'
          );

          const logEntry = logs[0];

          // Nested sensitive fields must be redacted
          expect(logEntry.req.headers.authorization).toBe('[REDACTED]');
          expect(logEntry.req.headers.cookie).toBe('[REDACTED]');
          expect(logEntry.req.body.password).toBe('[REDACTED]');
          expect(logEntry.req.body.token).toBe('[REDACTED]');

          // Non-sensitive nested fields must be preserved
          expect(logEntry.req.headers['content-type']).toBe(normalValue);
          expect(logEntry.req.body.username).toBe(normalValue);
          expect(logEntry.req.method).toBe(normalValue);
        }
      ),
      { numRuns: 100 }
    );
  });
});

import { describe, it, expect } from 'vitest';
import { HTTP_STATUS } from '../../../src/constants/httpStatus.js';
import { ERROR_CODES } from '../../../src/constants/errorCodes.js';

describe('HTTP Status Constants', () => {
  it('should export all required HTTP status codes', () => {
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.CREATED).toBe(201);
    expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
    expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
    expect(HTTP_STATUS.FORBIDDEN).toBe(403);
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
    expect(HTTP_STATUS.CONFLICT).toBe(409);
    expect(HTTP_STATUS.TOO_MANY_REQUESTS).toBe(429);
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    expect(HTTP_STATUS.SERVICE_UNAVAILABLE).toBe(503);
  });

  it('should be frozen (immutable)', () => {
    expect(Object.isFrozen(HTTP_STATUS)).toBe(true);
  });
});

describe('Error Code Constants', () => {
  it('should export all required error code strings', () => {
    expect(ERROR_CODES.BAD_REQUEST).toBe('BAD_REQUEST');
    expect(ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ERROR_CODES.UNAUTHORIZED).toBe('UNAUTHORIZED');
    expect(ERROR_CODES.FORBIDDEN).toBe('FORBIDDEN');
    expect(ERROR_CODES.NOT_FOUND).toBe('NOT_FOUND');
    expect(ERROR_CODES.CONFLICT).toBe('CONFLICT');
    expect(ERROR_CODES.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
    expect(ERROR_CODES.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
  });

  it('should be frozen (immutable)', () => {
    expect(Object.isFrozen(ERROR_CODES)).toBe(true);
  });
});

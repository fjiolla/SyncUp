import { describe, it, expect, vi } from 'vitest';
import { notFound } from '../../../src/middlewares/notFound.js';
import { HTTP_STATUS } from '../../../src/constants/httpStatus.js';

describe('notFound middleware', () => {
  it('should respond with 404 and standard error format', () => {
    const req = { method: 'GET', originalUrl: '/api/nonexistent' };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();

    notFound(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Route not found: GET /api/nonexistent',
      errors: null,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should include the HTTP method and path in the message', () => {
    const req = { method: 'POST', originalUrl: '/api/v1/users' };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();

    notFound(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Route not found: POST /api/v1/users',
      })
    );
  });
});

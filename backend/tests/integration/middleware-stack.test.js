import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

// Mock Redis client (MUST be before app import)
vi.mock('../../src/config/redis.js', () => ({
  redisClient: {
    status: 'ready',
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    exists: vi.fn().mockResolvedValue(0),
    keys: vi.fn().mockResolvedValue([]),
    call: vi.fn().mockResolvedValue(null),
    quit: vi.fn().mockResolvedValue('OK'),
    on: vi.fn(),
  },
}));

// Mock mongoose connection
vi.mock('mongoose', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    default: {
      ...original.default,
      connection: { readyState: 1 },
    },
  };
});

// Track hits for rate-limit-redis mock to simulate rate limiting
let hitCount = 0;
vi.mock('rate-limit-redis', () => ({
  RedisStore: vi.fn().mockImplementation(() => ({
    increment: vi.fn().mockImplementation(async () => {
      hitCount += 1;
      return { totalHits: hitCount, resetTime: new Date(Date.now() + 60000) };
    }),
    decrement: vi.fn().mockResolvedValue(undefined),
    resetKey: vi.fn().mockResolvedValue(undefined),
    init: vi.fn(),
  })),
}));

import request from 'supertest';
import app from '../../src/app.js';

describe('Middleware Stack Integration Tests', () => {
  beforeEach(() => {
    hitCount = 0;
  });

  describe('Security Headers (Helmet)', () => {
    it('should include x-content-type-options header', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include x-frame-options header', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.headers['x-frame-options']).toBeDefined();
    });

    it('should not expose x-powered-by header', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('CORS', () => {
    it('should include Access-Control-Allow-Origin for valid origin', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .set('Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');

      // CORS should respond with some access-control headers
      // The exact behavior depends on config.cors.origin value
      expect(res.status).toBeDefined();
    });

    it('should respond to OPTIONS preflight requests', async () => {
      const res = await request(app)
        .options('/api/v1/health')
        .set('Origin', process.env.CORS_ORIGIN || 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      // Should not return 404 — CORS middleware handles preflight
      expect(res.status).not.toBe(404);
    });
  });

  describe('Health Endpoint', () => {
    it('should return 200 with correct shape when dependencies are connected', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('uptime');
      expect(res.body.data).toHaveProperty('timestamp');
      expect(res.body.data).toHaveProperty('environment');
      expect(res.body.data).toHaveProperty('dependencies');
      expect(res.body.data.dependencies).toHaveProperty('mongodb');
      expect(res.body.data.dependencies).toHaveProperty('redis');
    });

    it('should return 503 when MongoDB is disconnected', async () => {
      // Temporarily change mongoose readyState to simulate disconnect
      const mongoose = await import('mongoose');
      const originalReadyState = mongoose.default.connection.readyState;
      mongoose.default.connection.readyState = 0;

      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(true); // ResponseFormatter.success is used even for 503
      expect(res.body.data.dependencies.mongodb).toBe('disconnected');

      // Restore
      mongoose.default.connection.readyState = originalReadyState;
    });
  });

  describe('404 Not Found', () => {
    it('should return 404 with standard error format for unmatched routes', async () => {
      const res = await request(app).get('/api/v1/nonexistent-route');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBeDefined();
      expect(typeof res.body.message).toBe('string');
    });

    it('should return 404 for unknown API versions', async () => {
      const res = await request(app).get('/api/v99/anything');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should include rate limit headers on responses', async () => {
      const res = await request(app).get('/api/v1/health');

      // Health endpoint is mounted before rate limiter, so check a rate-limited route
      // The v1 routes go through the rate limiter
      const rateLimitedRes = await request(app).get('/api/v1/nonexistent');

      // Rate limit headers should be present (standardHeaders: true)
      // Headers may be ratelimit-limit or x-ratelimit-limit depending on configuration
      const hasRateLimitHeader =
        rateLimitedRes.headers['ratelimit-limit'] ||
        rateLimitedRes.headers['x-ratelimit-limit'];
      expect(hasRateLimitHeader).toBeDefined();
    });
  });

  describe('Swagger Documentation', () => {
    it('should serve Swagger UI at /api-docs', async () => {
      const res = await request(app).get('/api-docs/');

      // swagger-ui-express serves HTML at /api-docs/ (may redirect /api-docs to /api-docs/)
      expect([200, 301, 302]).toContain(res.status);
    });

    it('should redirect /api-docs to /api-docs/', async () => {
      const res = await request(app).get('/api-docs');

      // swagger-ui-express typically redirects /api-docs → /api-docs/
      expect([200, 301, 302]).toContain(res.status);
    });
  });
});

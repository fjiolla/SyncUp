import { vi, describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';

// Mock the redis module
vi.mock('../../../src/config/redis.js', () => {
  const store = new Map();
  return {
    redisClient: {
      get: vi.fn(async (key) => store.get(key) || null),
      set: vi.fn(async (key, value) => { store.set(key, value); }),
      del: vi.fn(async (...keys) => { keys.forEach(k => store.delete(k)); }),
      exists: vi.fn(async (key) => store.has(key) ? 1 : 0),
      keys: vi.fn(async () => []),
    },
  };
});

// Mock the logger
vi.mock('../../../src/logger/index.js', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

// Mock the config
vi.mock('../../../src/config/index.js', () => ({
  config: {
    server: { nodeEnv: 'test', port: 3000, logLevel: 'info' },
    redis: { url: 'redis://localhost:6379' },
  },
}));

import { CacheService } from '../../../src/services/cache.service.js';
import { redisClient } from '../../../src/config/redis.js';

describe('CacheService Property Tests', () => {
  beforeEach(() => {
    // Clear the internal store between tests by resetting mocks
    const store = new Map();
    redisClient.get.mockImplementation(async (key) => store.get(key) || null);
    redisClient.set.mockImplementation(async (key, value, ...rest) => { store.set(key, value); });
    redisClient.del.mockImplementation(async (...keys) => { keys.forEach(k => store.delete(k)); });
  });

  /**
   * Property 15: Cache Service serialization round trip
   * For any JSON-serializable value V, set followed by get returns a value deeply equal to V.
   *
   * **Validates: Requirements 15.3**
   */
  it('Property 15: set followed by get returns a value deeply equal to the original', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.jsonValue().filter((v) => JSON.stringify(v) !== undefined),
        async (value) => {
          const key = 'test:roundtrip';

          await CacheService.set(key, value);
          const result = await CacheService.get(key);

          expect(result).toStrictEqual(value);
        }
      ),
      { numRuns: 100 }
    );
  });
});

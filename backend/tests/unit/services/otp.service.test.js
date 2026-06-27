import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../../src/config/redis.js', () => ({
  redisClient: {},
}));

vi.mock('../../../src/logger/index.js', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

vi.mock('../../../src/config/index.js', () => ({
  config: {
    server: { nodeEnv: 'test', port: 3000, logLevel: 'info' },
    redis: { url: 'redis://localhost:6379' },
  },
}));

const mockCacheStore = new Map();

vi.mock('../../../src/services/cache.service.js', () => ({
  CacheService: {
    get: vi.fn(async (key) => mockCacheStore.get(key) || null),
    set: vi.fn(async (key, value) => { mockCacheStore.set(key, value); }),
    delete: vi.fn(async (key) => { mockCacheStore.delete(key); }),
    exists: vi.fn(async (key) => mockCacheStore.has(key)),
  },
}));

import { OTPService } from '../../../src/services/otp.service.js';
import { CacheService } from '../../../src/services/cache.service.js';

describe('OTPService', () => {
  beforeEach(() => {
    mockCacheStore.clear();
    vi.clearAllMocks();
  });

  describe('generate()', () => {
    it('should return a 6-digit numeric string', () => {
      const otp = OTPService.generate();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should return a string between 100000 and 999999', () => {
      const otp = OTPService.generate();
      const num = parseInt(otp, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThanOrEqual(999999);
    });
  });

  describe('store()', () => {
    it('should store OTP with attempts at 0 and set rate limit key', async () => {
      await OTPService.store('+1234567890', '123456');

      expect(CacheService.exists).toHaveBeenCalledWith('otp:ratelimit:+1234567890');
      expect(CacheService.set).toHaveBeenCalledWith('otp:+1234567890', { otp: '123456', attempts: 0 }, 300);
      expect(CacheService.set).toHaveBeenCalledWith('otp:ratelimit:+1234567890', true, 60);
    });

    it('should throw tooManyRequests if rate limit key exists', async () => {
      mockCacheStore.set('otp:ratelimit:+1234567890', true);

      await expect(OTPService.store('+1234567890', '123456'))
        .rejects.toThrow('Please wait before requesting another OTP');
    });
  });

  describe('verify()', () => {
    it('should return true and delete key when OTP matches', async () => {
      mockCacheStore.set('otp:+1234567890', { otp: '123456', attempts: 0 });

      const result = await OTPService.verify('+1234567890', '123456');

      expect(result).toBe(true);
      expect(CacheService.delete).toHaveBeenCalledWith('otp:+1234567890');
    });

    it('should throw badRequest when no OTP is stored', async () => {
      await expect(OTPService.verify('+1234567890', '123456'))
        .rejects.toThrow('OTP expired or not found');
    });

    it('should throw tooManyRequests and delete key when attempts >= 3', async () => {
      mockCacheStore.set('otp:+1234567890', { otp: '123456', attempts: 3 });

      await expect(OTPService.verify('+1234567890', '123456'))
        .rejects.toThrow('Maximum verification attempts exceeded');
      expect(CacheService.delete).toHaveBeenCalledWith('otp:+1234567890');
    });

    it('should increment attempts and throw badRequest when OTP does not match', async () => {
      mockCacheStore.set('otp:+1234567890', { otp: '123456', attempts: 0 });

      await expect(OTPService.verify('+1234567890', '999999'))
        .rejects.toThrow('Invalid OTP');
      expect(CacheService.set).toHaveBeenCalledWith('otp:+1234567890', { otp: '123456', attempts: 1 }, 300);
    });
  });
});

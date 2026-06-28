import { describe, it, expect } from 'vitest';
import { validateEnv, buildConfig } from '../../../src/config/index.js';

// Valid env for all tests to start from
const VALID_ENV = {
  NODE_ENV: 'development',
  PORT: '3000',
  MONGODB_URI: 'mongodb://localhost:27017/test',
  REDIS_URL: 'redis://localhost:6379',
  CLOUDINARY_CLOUD_NAME: 'testcloud',
  CLOUDINARY_API_KEY: '123456',
  CLOUDINARY_API_SECRET: 'secret123',
  SENDGRID_API_KEY: 'SG.test',
  CORS_ORIGIN: 'http://localhost:3000',
  LOG_LEVEL: 'info',
  JWT_ACCESS_SECRET: 'test-access-secret',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
  JWT_ACCESS_EXPIRY: '1d',
  JWT_REFRESH_EXPIRY: '10d',
  GOOGLE_CLIENT_ID: 'google-client-id',
  GOOGLE_CLIENT_SECRET: 'google-client-secret',
  GOOGLE_CALLBACK_URL: 'http://localhost:5000/api/auth/google/callback',
  GITHUB_CLIENT_ID: 'github-client-id',
  GITHUB_CLIENT_SECRET: 'github-client-secret',
  GITHUB_CALLBACK_URL: 'http://localhost:5000/api/auth/github/callback',
};

function makeEnv(overrides = {}) {
  const env = { ...VALID_ENV, ...overrides };
  // Allow removing keys by setting them to undefined
  Object.keys(env).forEach((key) => {
    if (env[key] === undefined) {
      delete env[key];
    }
  });
  return env;
}

describe('Config Manager', () => {
  describe('validateEnv - missing variables', () => {
    it('should return errors listing all missing variables when multiple are absent', () => {
      const env = makeEnv({
        MONGODB_URI: undefined,
        REDIS_URL: undefined,
        CORS_ORIGIN: undefined,
      });

      const errors = validateEnv(env);
      expect(errors.length).toBeGreaterThan(0);
      const errorMsg = errors.join('\n');
      expect(errorMsg).toContain('MONGODB_URI');
      expect(errorMsg).toContain('REDIS_URL');
      expect(errorMsg).toContain('CORS_ORIGIN');
    });

    it('should return error when env var is whitespace-only', () => {
      const env = makeEnv({ SENDGRID_API_KEY: '   ' });

      const errors = validateEnv(env);
      const errorMsg = errors.join('\n');
      expect(errorMsg).toContain('SENDGRID_API_KEY');
    });

    it('should return error when env var is empty string', () => {
      const env = makeEnv({ CLOUDINARY_API_KEY: '' });

      const errors = validateEnv(env);
      const errorMsg = errors.join('\n');
      expect(errorMsg).toContain('CLOUDINARY_API_KEY');
    });

    it('should return no errors when all required vars are present and non-empty', () => {
      const env = makeEnv();

      const errors = validateEnv(env);
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateEnv - PORT validation', () => {
    it('should return error for non-numeric PORT', () => {
      const env = makeEnv({ PORT: 'abc' });

      const errors = validateEnv(env);
      const errorMsg = errors.join('\n');
      expect(errorMsg).toContain('Invalid PORT');
    });

    it('should return error for PORT = 0', () => {
      const env = makeEnv({ PORT: '0' });

      const errors = validateEnv(env);
      const errorMsg = errors.join('\n');
      expect(errorMsg).toContain('Invalid PORT');
    });

    it('should return error for PORT > 65535', () => {
      const env = makeEnv({ PORT: '70000' });

      const errors = validateEnv(env);
      const errorMsg = errors.join('\n');
      expect(errorMsg).toContain('Invalid PORT');
    });

    it('should return error for negative PORT', () => {
      const env = makeEnv({ PORT: '-1' });

      const errors = validateEnv(env);
      const errorMsg = errors.join('\n');
      expect(errorMsg).toContain('Invalid PORT');
    });

    it('should return error for decimal PORT', () => {
      const env = makeEnv({ PORT: '3000.5' });

      const errors = validateEnv(env);
      const errorMsg = errors.join('\n');
      expect(errorMsg).toContain('Invalid PORT');
    });

    it('should accept valid PORT value at boundary 1', () => {
      const env = makeEnv({ PORT: '1' });
      const errors = validateEnv(env);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid PORT value at boundary 65535', () => {
      const env = makeEnv({ PORT: '65535' });
      const errors = validateEnv(env);
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateEnv - NODE_ENV validation', () => {
    it('should return error for invalid NODE_ENV', () => {
      const env = makeEnv({ NODE_ENV: 'staging' });

      const errors = validateEnv(env);
      const errorMsg = errors.join('\n');
      expect(errorMsg).toContain('Invalid NODE_ENV');
    });

    it('should accept development', () => {
      const env = makeEnv({ NODE_ENV: 'development' });
      const errors = validateEnv(env);
      expect(errors).toHaveLength(0);
    });

    it('should accept production', () => {
      const env = makeEnv({ NODE_ENV: 'production' });
      const errors = validateEnv(env);
      expect(errors).toHaveLength(0);
    });

    it('should accept test', () => {
      const env = makeEnv({ NODE_ENV: 'test' });
      const errors = validateEnv(env);
      expect(errors).toHaveLength(0);
    });

    it('should accept case-insensitive NODE_ENV (DEVELOPMENT)', () => {
      const env = makeEnv({ NODE_ENV: 'DEVELOPMENT' });
      const errors = validateEnv(env);
      expect(errors).toHaveLength(0);
    });

    it('should accept case-insensitive NODE_ENV (Production)', () => {
      const env = makeEnv({ NODE_ENV: 'Production' });
      const errors = validateEnv(env);
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateEnv - combined errors', () => {
    it('should report both missing vars and invalid PORT in single validation', () => {
      const env = makeEnv({ REDIS_URL: undefined, PORT: 'abc' });

      const errors = validateEnv(env);
      const errorMsg = errors.join('\n');
      expect(errorMsg).toContain('REDIS_URL');
      expect(errorMsg).toContain('Invalid PORT');
    });

    it('should report missing vars and invalid NODE_ENV together', () => {
      const env = makeEnv({ CORS_ORIGIN: undefined, NODE_ENV: 'staging' });

      const errors = validateEnv(env);
      const errorMsg = errors.join('\n');
      expect(errorMsg).toContain('CORS_ORIGIN');
      expect(errorMsg).toContain('Invalid NODE_ENV');
    });
  });

  describe('buildConfig - throws on invalid env', () => {
    it('should throw error listing all issues in a single message', () => {
      const env = makeEnv({ REDIS_URL: undefined, PORT: 'abc' });

      expect(() => buildConfig(env)).toThrow('Configuration validation failed');
      expect(() => buildConfig(env)).toThrow('REDIS_URL');
      expect(() => buildConfig(env)).toThrow('Invalid PORT');
    });
  });

  describe('buildConfig - config object structure', () => {
    it('should export config grouped by concern', () => {
      const config = buildConfig(makeEnv());

      expect(config).toHaveProperty('server');
      expect(config).toHaveProperty('database');
      expect(config).toHaveProperty('redis');
      expect(config).toHaveProperty('cloudinary');
      expect(config).toHaveProperty('email');
      expect(config).toHaveProperty('cors');
      expect(config).toHaveProperty('rateLimit');
    });

    it('should have correct server config values', () => {
      const config = buildConfig(makeEnv());

      expect(config.server.port).toBe(3000);
      expect(config.server.nodeEnv).toBe('development');
      expect(config.server.logLevel).toBe('info');
    });

    it('should normalize NODE_ENV to lowercase', () => {
      const config = buildConfig(makeEnv({ NODE_ENV: 'DEVELOPMENT' }));

      expect(config.server.nodeEnv).toBe('development');
    });

    it('should have correct database config', () => {
      const config = buildConfig(makeEnv());

      expect(config.database.uri).toBe('mongodb://localhost:27017/test');
    });

    it('should have correct redis config', () => {
      const config = buildConfig(makeEnv());

      expect(config.redis.url).toBe('redis://localhost:6379');
    });

    it('should have correct cloudinary config', () => {
      const config = buildConfig(makeEnv());

      expect(config.cloudinary.cloudName).toBe('testcloud');
      expect(config.cloudinary.apiKey).toBe('123456');
      expect(config.cloudinary.apiSecret).toBe('secret123');
    });

    it('should have correct email config', () => {
      const config = buildConfig(makeEnv());

      expect(config.email.sendgridApiKey).toBe('SG.test');
    });

    it('should have correct cors config', () => {
      const config = buildConfig(makeEnv());

      expect(config.cors.origin).toBe('http://localhost:3000');
    });

    it('should have rate limit defaults when env vars not set', () => {
      const config = buildConfig(makeEnv());

      expect(config.rateLimit.windowMs).toBe(15 * 60 * 1000);
      expect(config.rateLimit.max).toBe(600);
    });

    it('should use custom rate limit values from env', () => {
      const config = buildConfig(
        makeEnv({ RATE_LIMIT_WINDOW_MS: '60000', RATE_LIMIT_MAX: '50' })
      );

      expect(config.rateLimit.windowMs).toBe(60000);
      expect(config.rateLimit.max).toBe(50);
    });
  });

  describe('buildConfig - deep freeze', () => {
    it('should not allow modification of top-level config', () => {
      const config = buildConfig(makeEnv());

      expect(() => {
        config.newProp = 'value';
      }).toThrow();
    });

    it('should not allow modification of nested config groups', () => {
      const config = buildConfig(makeEnv());

      expect(() => {
        config.server.port = 9999;
      }).toThrow();
    });

    it('should not allow adding properties to nested groups', () => {
      const config = buildConfig(makeEnv());

      expect(() => {
        config.database.password = 'hack';
      }).toThrow();
    });

    it('should not allow deleting properties from nested groups', () => {
      const config = buildConfig(makeEnv());

      expect(() => {
        delete config.server.port;
      }).toThrow();
    });
  });
});

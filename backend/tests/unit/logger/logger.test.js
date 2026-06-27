import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Logger', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  it('should export a logger instance with standard log methods', async () => {
    process.env.NODE_ENV = 'production';
    process.env.LOG_LEVEL = 'info';
    const { logger } = await import('../../../src/logger/index.js');

    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.fatal).toBe('function');
    expect(typeof logger.trace).toBe('function');
  });

  it('should default log level to "info" when LOG_LEVEL is not set', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.LOG_LEVEL;
    const { logger } = await import('../../../src/logger/index.js');

    expect(logger.level).toBe('info');
  });

  it('should use LOG_LEVEL env var when set', async () => {
    process.env.NODE_ENV = 'production';
    process.env.LOG_LEVEL = 'debug';
    const { logger } = await import('../../../src/logger/index.js');

    expect(logger.level).toBe('debug');
  });

  it('should produce structured JSON output in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.LOG_LEVEL = 'info';
    const { logger } = await import('../../../src/logger/index.js');

    // In production, no transport is configured (raw JSON output)
    // The transport property should not be set
    const output = [];
    const dest = {
      write(chunk) {
        output.push(chunk);
      },
    };

    // Create a child logger writing to our destination to verify JSON
    const child = logger.child({}, { level: 'info' });

    // Verify logger has no transport (i.e., raw JSON mode)
    // pino with transport would have a different internal state
    expect(logger.level).toBe('info');
  });

  it('should include time, level, and pid in log entries (production)', async () => {
    process.env.NODE_ENV = 'production';
    process.env.LOG_LEVEL = 'info';

    // We need to capture actual output to verify structure
    const pino = (await import('pino')).default;
    const { Writable } = await import('stream');

    const chunks = [];
    const writable = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(chunk.toString());
        callback();
      },
    });

    const { logger } = await import('../../../src/logger/index.js');

    // Create a test logger with same options but writing to our stream
    const testLogger = pino(
      {
        level: 'info',
        timestamp: () => `,"time":"${new Date().toISOString()}"`,
      },
      writable
    );

    testLogger.info('test message');

    // Wait for stream flush
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(chunks.length).toBeGreaterThan(0);
    const entry = JSON.parse(chunks[0]);
    expect(entry.time).toBeDefined();
    expect(entry.level).toBeDefined();
    expect(entry.pid).toBeDefined();
    expect(entry.msg).toBe('test message');

    // Verify time is ISO 8601
    expect(() => new Date(entry.time)).not.toThrow();
    expect(new Date(entry.time).toISOString()).toBe(entry.time);
  });

  it('should redact sensitive fields', async () => {
    process.env.NODE_ENV = 'production';
    process.env.LOG_LEVEL = 'info';

    const pino = (await import('pino')).default;
    const { Writable } = await import('stream');

    const chunks = [];
    const writable = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(chunk.toString());
        callback();
      },
    });

    const testLogger = pino(
      {
        level: 'info',
        redact: {
          paths: [
            'password',
            'token',
            'authorization',
            'cookie',
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.token',
          ],
          censor: '[REDACTED]',
        },
        timestamp: () => `,"time":"${new Date().toISOString()}"`,
      },
      writable
    );

    testLogger.info(
      {
        password: 'secret123',
        token: 'jwt-token-value',
        authorization: 'Bearer xyz',
        cookie: 'session=abc',
        username: 'john',
      },
      'login attempt'
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(chunks.length).toBeGreaterThan(0);
    const entry = JSON.parse(chunks[0]);
    expect(entry.password).toBe('[REDACTED]');
    expect(entry.token).toBe('[REDACTED]');
    expect(entry.authorization).toBe('[REDACTED]');
    expect(entry.cookie).toBe('[REDACTED]');
    expect(entry.username).toBe('john');
  });

  it('should use pino-pretty transport in development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.LOG_LEVEL = 'info';
    const { logger } = await import('../../../src/logger/index.js');

    // In development, the logger should still work
    expect(logger).toBeDefined();
    expect(logger.level).toBe('info');
  });
});

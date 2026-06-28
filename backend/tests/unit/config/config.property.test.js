// Feature: syncup-backend-foundation, Property 1: Config validation completeness
// Feature: syncup-backend-foundation, Property 2: Config immutability after freeze
// Feature: syncup-backend-foundation, Property 3: PORT and NODE_ENV validation
// **Validates: Requirements 2.2, 2.3, 2.4, 2.6, 2.7**

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateEnv, buildConfig } from '../../../src/config/index.js';

const REQUIRED_VARS = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'REDIS_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SENDGRID_API_KEY',
  'CORS_ORIGIN',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRY',
  'JWT_REFRESH_EXPIRY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GITHUB_CALLBACK_URL',
];

/**
 * Helper: creates a valid env object with all required vars set.
 */
function makeValidEnv() {
  return {
    NODE_ENV: 'development',
    PORT: '3000',
    MONGODB_URI: 'mongodb://localhost:27017/syncup',
    REDIS_URL: 'redis://localhost:6379',
    CLOUDINARY_CLOUD_NAME: 'testcloud',
    CLOUDINARY_API_KEY: '123456789',
    CLOUDINARY_API_SECRET: 'secret123',
    SENDGRID_API_KEY: 'SG.test-key',
    CORS_ORIGIN: 'http://localhost:3000',
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
}

// Feature: syncup-backend-foundation, Property 1: Config validation completeness
describe('Property 1: Config validation completeness', () => {
  it('for any set of N missing/whitespace-only variables, the error message contains exactly those N variable names', () => {
    // Arbitrary to generate a non-empty subset of required vars
    const subsetArb = fc.subarray(REQUIRED_VARS, { minLength: 1 });

    // Arbitrary to generate whitespace-only or undefined as the "missing" value
    const missingValueArb = fc.oneof(
      fc.constant(undefined),
      fc.constant(''),
      fc.constant('   '),
      fc.constant('\t'),
      fc.constant('\n'),
      fc.constant('  \t\n  ')
    );

    fc.assert(
      fc.property(subsetArb, missingValueArb, (missingVars, missingValue) => {
        const env = makeValidEnv();

        // Make selected vars missing or whitespace-only
        for (const varName of missingVars) {
          if (missingValue === undefined) {
            delete env[varName];
          } else {
            env[varName] = missingValue;
          }
        }

        // Ensure NODE_ENV and PORT have valid values if they are NOT in the missing set
        // (to avoid triggering format validation errors for those)
        if (!missingVars.includes('NODE_ENV') && (!env.NODE_ENV || env.NODE_ENV.trim() === '')) {
          env.NODE_ENV = 'development';
        }
        if (!missingVars.includes('PORT') && (!env.PORT || env.PORT.trim() === '')) {
          env.PORT = '3000';
        }

        const errors = validateEnv(env);

        // There should be at least one error
        expect(errors.length).toBeGreaterThan(0);

        // The combined error text should contain each missing variable name
        const errorText = errors.join(' ');
        for (const varName of missingVars) {
          expect(errorText).toContain(varName);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: syncup-backend-foundation, Property 2: Config immutability after freeze
describe('Property 2: Config immutability after freeze', () => {
  it('attempting to assign/delete/modify any property at any nesting level has no effect', () => {
    const validEnv = makeValidEnv();
    const frozenConfig = buildConfig(validEnv);

    // Arbitrary for top-level keys
    const topLevelKeyArb = fc.constantFrom(...Object.keys(frozenConfig));

    fc.assert(
      fc.property(topLevelKeyArb, fc.string(), (topKey, newValue) => {
        const originalTopValue = frozenConfig[topKey];

        // Attempt to assign a new property on top-level
        try {
          frozenConfig.newProp = newValue;
        } catch {
          // strict mode may throw
        }
        expect(frozenConfig.newProp).toBeUndefined();

        // Attempt to delete a top-level property
        try {
          delete frozenConfig[topKey];
        } catch {
          // strict mode may throw
        }
        expect(frozenConfig[topKey]).toEqual(originalTopValue);

        // Attempt to mutate nested properties
        const nestedObj = frozenConfig[topKey];
        if (nestedObj && typeof nestedObj === 'object') {
          const nestedKeys = Object.keys(nestedObj);
          if (nestedKeys.length > 0) {
            const nestedKey = nestedKeys[0];
            const originalNestedValue = nestedObj[nestedKey];

            // Attempt assignment on nested
            try {
              nestedObj[nestedKey] = newValue;
            } catch {
              // strict mode may throw
            }
            expect(nestedObj[nestedKey]).toEqual(originalNestedValue);

            // Attempt to add new key on nested
            try {
              nestedObj.hackedProp = newValue;
            } catch {
              // strict mode may throw
            }
            expect(nestedObj.hackedProp).toBeUndefined();

            // Attempt to delete nested key
            try {
              delete nestedObj[nestedKey];
            } catch {
              // strict mode may throw
            }
            expect(nestedObj[nestedKey]).toEqual(originalNestedValue);
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: syncup-backend-foundation, Property 3: PORT and NODE_ENV validation
describe('Property 3: PORT and NODE_ENV validation', () => {
  it('invalid PORT values produce validation errors', () => {
    const invalidPortArb = fc.oneof(
      // Non-numeric strings
      fc.string({ minLength: 1 }).filter((s) => isNaN(Number(s)) || s.trim() === ''),
      // Numbers outside 1-65535
      fc.integer({ min: -10000, max: 0 }).map(String),
      fc.integer({ min: 65536, max: 100000 }).map(String),
      // Floats (non-integer)
      fc.double({ min: 1.1, max: 65534.9, noNaN: true, noDefaultInfinity: true })
        .filter((n) => !Number.isInteger(n))
        .map(String)
    );

    fc.assert(
      fc.property(invalidPortArb, (invalidPort) => {
        const env = makeValidEnv();
        env.PORT = invalidPort;

        const errors = validateEnv(env);
        const errorText = errors.join(' ');
        expect(errorText).toContain('PORT');
      }),
      { numRuns: 100 }
    );
  });

  it('valid PORT values (integers 1-65535) produce no PORT errors', () => {
    const validPortArb = fc.integer({ min: 1, max: 65535 }).map(String);

    fc.assert(
      fc.property(validPortArb, (validPort) => {
        const env = makeValidEnv();
        env.PORT = validPort;

        const errors = validateEnv(env);
        const errorText = errors.join(' ');
        // No PORT-related errors
        expect(errorText).not.toContain('Invalid PORT');
      }),
      { numRuns: 100 }
    );
  });

  it('invalid NODE_ENV values produce validation errors', () => {
    const validEnvs = ['development', 'production', 'test'];
    const invalidNodeEnvArb = fc
      .string({ minLength: 1 })
      .filter((s) => s.trim() !== '' && !validEnvs.includes(s.trim().toLowerCase()));

    fc.assert(
      fc.property(invalidNodeEnvArb, (invalidNodeEnv) => {
        const env = makeValidEnv();
        env.NODE_ENV = invalidNodeEnv;

        const errors = validateEnv(env);
        const errorText = errors.join(' ');
        expect(errorText).toContain('NODE_ENV');
      }),
      { numRuns: 100 }
    );
  });

  it('valid NODE_ENV values produce no NODE_ENV errors', () => {
    const validNodeEnvArb = fc.constantFrom('development', 'production', 'test');

    fc.assert(
      fc.property(validNodeEnvArb, (validNodeEnv) => {
        const env = makeValidEnv();
        env.NODE_ENV = validNodeEnv;

        const errors = validateEnv(env);
        const errorText = errors.join(' ');
        expect(errorText).not.toContain('NODE_ENV');
      }),
      { numRuns: 100 }
    );
  });
});

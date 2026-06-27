import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

const REQUIRED_ENV_VARS = [
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

const VALID_NODE_ENVS = ['development', 'production', 'test'];

export function validateEnv(env = process.env) {
  const errors = [];

  const missing = REQUIRED_ENV_VARS.filter((key) => {
    const value = env[key];
    return value === undefined || value.trim() === '';
  });

  if (missing.length > 0) {
    errors.push(`Missing or empty environment variables: ${missing.join(', ')}`);
  }

  const portValue = env.PORT;
  if (portValue !== undefined && portValue.trim() !== '') {
    const port = Number(portValue);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      errors.push(
        `Invalid PORT "${portValue}": must be a numeric value between 1 and 65535`
      );
    }
  }

  const nodeEnvValue = env.NODE_ENV;
  if (nodeEnvValue !== undefined && nodeEnvValue.trim() !== '') {
    const normalized = nodeEnvValue.trim().toLowerCase();
    if (!VALID_NODE_ENVS.includes(normalized)) {
      errors.push(
        `Invalid NODE_ENV "${nodeEnvValue}": must be one of development, production, test`
      );
    }
  }

  return errors;
}

export function buildConfig(env = process.env) {
  const errors = validateEnv(env);

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  const nodeEnv = env.NODE_ENV.trim().toLowerCase();
  const port = parseInt(env.PORT, 10);

  const configObj = {
    server: {
      port,
      nodeEnv,
      logLevel: env.LOG_LEVEL || 'info',
    },
    database: {
      uri: env.MONGODB_URI,
    },
    redis: {
      url: env.REDIS_URL,
    },
    cloudinary: {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      apiSecret: env.CLOUDINARY_API_SECRET,
    },
    email: {
      sendgridApiKey: env.SENDGRID_API_KEY,
    },
    cors: {
      origin: env.CORS_ORIGIN,
    },
    rateLimit: {
      windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
      max: parseInt(env.RATE_LIMIT_MAX, 10) || 600,
    },
    jwt: {
      accessSecret: env.JWT_ACCESS_SECRET,
      refreshSecret: env.JWT_REFRESH_SECRET,
      accessExpiry: env.JWT_ACCESS_EXPIRY,
      refreshExpiry: env.JWT_REFRESH_EXPIRY,
    },
    oauth: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackUrl: env.GOOGLE_CALLBACK_URL,
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackUrl: env.GITHUB_CALLBACK_URL,
      },
    },
  };

  Object.keys(configObj).forEach((key) => {
    if (typeof configObj[key] === 'object' && configObj[key] !== null) {
      Object.keys(configObj[key]).forEach((nestedKey) => {
        if (typeof configObj[key][nestedKey] === 'object' && configObj[key][nestedKey] !== null) {
          Object.freeze(configObj[key][nestedKey]);
        }
      });
    }
    Object.freeze(configObj[key]);
  });
  Object.freeze(configObj);

  return configObj;
}

export const config = buildConfig();

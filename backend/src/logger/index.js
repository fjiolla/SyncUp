import pino from 'pino';

const nodeEnv = process.env.NODE_ENV || 'development';
const logLevel = process.env.LOG_LEVEL || 'info';

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

const baseOptions = {
  level: logLevel,
  redact: {
    paths: redactPaths,
    censor: '[REDACTED]',
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
};

let logger;

if (nodeEnv === 'development') {
  logger = pino({
    ...baseOptions,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  });
} else {
  logger = pino(baseOptions);
}

export { logger };

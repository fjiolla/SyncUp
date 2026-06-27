import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import passport from 'passport';
import pinoHttp from 'pino-http';
import { config } from './config/index.js';
import { logger } from './logger/index.js';
import { rateLimiter } from './middlewares/rateLimiter.js';
import { xssSanitizer } from './middlewares/xssSanitizer.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { ResponseFormatter } from './utils/responseFormatter.js';
import v1Routes from './routes/v1/index.js';
import { setupSwagger } from './swagger/index.js';
import healthRoutes from './routes/v1/health.routes.js';
import './config/passport.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(compression());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(mongoSanitize());
app.use(xssSanitizer);
app.use(hpp());
app.use(pinoHttp({ logger }));

setupSwagger(app);

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use('/api/v1/health', healthRoutes);
app.use('/api/', rateLimiter);
app.use('/api/v1/', v1Routes);

app.use('/api/:version', (req, res) => {
  ResponseFormatter.error(res, {
    statusCode: 404,
    message: `API version "${req.params.version}" is not available. Please use /api/v1/`,
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from '../config/index.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SyncUp API',
      version: '1.0.0',
      description: 'SyncUp platform API documentation',
    },
    servers: [
      { url: `http://localhost:${config.server.port}`, description: 'Development' },
      { url: 'https://api.syncup.com', description: 'Production' },
    ],
    components: {
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object', nullable: true },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'object', nullable: true },
          },
        },
      },
    },
  },
  apis: ['./src/routes/**/*.js', './src/controllers/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  if (config.server.nodeEnv === 'production' && process.env.DISABLE_SWAGGER === 'true') {
    return;
  }
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

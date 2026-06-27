import Joi from 'joi';
import { ApiError } from '../exceptions/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  const errors = [];
  const properties = ['body', 'query', 'params'];

  for (const property of properties) {
    if (schema[property]) {
      const { error, value } = schema[property].validate(req[property], {
        abortEarly: false,
        stripUnknown: true,
        errors: { wrap: { label: false } },
      });

      if (error) {
        const fieldErrors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
          source: property,
        }));
        errors.push(...fieldErrors);
      } else {
        req[property] = value;
      }
    }
  }

  if (errors.length > 0) {
    throw ApiError.badRequest('Validation failed', errors);
  }

  next();
};

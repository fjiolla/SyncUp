import Joi from 'joi';

const coordinatesSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  displayName: Joi.string().max(500).allow(''),
});

export const createEventSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).max(5000).required(),
    banner: Joi.string().uri().allow(''),
    location: Joi.string().max(500).allow(''),
    coordinates: coordinatesSchema.optional(),
    eventType: Joi.string().valid('online', 'offline', 'hybrid'),
    startDate: Joi.date().iso().greater('now').required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
    maxParticipants: Joi.number().integer().min(1).max(100000),
    registrationDeadline: Joi.date().iso(),
  }),
};

export const updateEventSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(200),
    description: Joi.string().min(10).max(5000),
    banner: Joi.string().uri().allow(''),
    location: Joi.string().max(500).allow(''),
    coordinates: coordinatesSchema.optional(),
    eventType: Joi.string().valid('online', 'offline', 'hybrid'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    maxParticipants: Joi.number().integer().min(1).max(100000),
    registrationDeadline: Joi.date().iso(),
  }),
};

export const eventIdParamSchema = {
  params: Joi.object({
    eventId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
};

export const paginationSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
  }),
};

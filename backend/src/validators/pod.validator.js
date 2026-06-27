import Joi from 'joi';

const coordinatesSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  displayName: Joi.string().max(500).allow(''),
}).allow(null);

export const createPodSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(2000).required(),
    category: Joi.string().required(),
    customCategory: Joi.string().max(100).allow(''),
    tags: Joi.array().items(Joi.string()),
    visibility: Joi.string().valid('public', 'private'),
    eventType: Joi.string().valid('virtual', 'in-person', 'hybrid'),
    location: Joi.string().max(500).allow(''),
    coordinates: coordinatesSchema.optional(),
    meetingUrl: Joi.string().uri().allow(''),
    startDate: Joi.date().iso().allow(null),
    endDate: Joi.date().iso().allow(null),
    maxMembers: Joi.number().integer().min(1).max(100000),
    rules: Joi.array().items(Joi.string()),
    requiresApproval: Joi.boolean(),
    banner: Joi.string().max(15_000_000).allow(''),
  }),
};

export const updatePodSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().min(10).max(2000),
    category: Joi.string(),
    customCategory: Joi.string().max(100).allow(''),
    tags: Joi.array().items(Joi.string()),
    visibility: Joi.string().valid('public', 'private'),
    eventType: Joi.string().valid('virtual', 'in-person', 'hybrid'),
    location: Joi.string().max(500).allow(''),
    coordinates: coordinatesSchema.optional(),
    meetingUrl: Joi.string().uri().allow(''),
    startDate: Joi.date().iso().allow(null),
    endDate: Joi.date().iso().allow(null),
    maxMembers: Joi.number().integer().min(1).max(100000),
    rules: Joi.array().items(Joi.string()),
    requiresApproval: Joi.boolean(),
    banner: Joi.string().max(15_000_000).allow(''),
  }),
};

export const podIdParamSchema = {
  params: Joi.object({
    podId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
};

export const memberActionSchema = {
  params: Joi.object({
    podId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
};

export const promoteSchema = {
  params: Joi.object({
    podId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
  body: Joi.object({
    role: Joi.string().valid('admin', 'moderator', 'member').required(),
  }),
};

export const discoverSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    category: Joi.string(),
    search: Joi.string(),
    sort: Joi.string(),
  }),
};

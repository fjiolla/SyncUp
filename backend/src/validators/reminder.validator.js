import Joi from 'joi';

export const eventIdParamSchema = {
  params: Joi.object({
    eventId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
};

import Joi from 'joi';

export const sendMessageSchema = {
  body: Joi.object({
    content: Joi.string().min(1).max(2000).required(),
    attachments: Joi.array().items(Joi.string()),
  }),
};

export const conversationParamSchema = {
  params: Joi.object({
    conversationId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
};

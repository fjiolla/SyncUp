import Joi from 'joi';

export const createPostSchema = {
  body: Joi.object({
    content: Joi.string().min(1).max(5000).required(),
    images: Joi.array().items(Joi.string()).max(10),
    visibility: Joi.string().valid('public', 'pod_only'),
  }),
};

export const updatePostSchema = {
  body: Joi.object({
    content: Joi.string().min(1).max(5000),
    images: Joi.array().items(Joi.string()).max(10),
  }),
};

export const commentSchema = {
  body: Joi.object({
    content: Joi.string().min(1).max(2000).required(),
    parentComment: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  }),
};

export const postIdParamSchema = {
  params: Joi.object({
    postId: Joi.string().required(),
  }),
};

export const commentIdParamSchema = {
  params: Joi.object({
    commentId: Joi.string().required(),
  }),
};

export const paginationSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    sort: Joi.string(),
  }),
};

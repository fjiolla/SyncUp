import Joi from 'joi';

export const registerSchema = {
  body: Joi.object({
    fullName: Joi.string().min(2).max(50).required(),
    username: Joi.string().min(3).max(30).alphanum().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

export const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).required(),
  }),
};

export const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
  }),
};

export const updateProfileSchema = {
  body: Joi.object({
    fullName: Joi.string().min(2).max(50),
    username: Joi.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
    bio: Joi.string().max(500).allow(''),
    location: Joi.string().max(100).allow(''),
    interests: Joi.array().items(Joi.string()),
    profession: Joi.string().max(100).allow(''),
    college: Joi.string().max(100).allow(''),
    website: Joi.string().uri().allow(''),
    profileImage: Joi.string().max(15_000_000).allow(''),
    coverImage: Joi.string().max(15_000_000).allow(''),
    socialLinks: Joi.object({
      twitter: Joi.string().allow(''),
      github: Joi.string().allow(''),
      linkedin: Joi.string().allow(''),
    }),
  }).optional(),
};

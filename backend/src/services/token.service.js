import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { ApiError } from '../exceptions/ApiError.js';

export const TokenService = {
  generateAccessToken(payload) {
    return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiry });
  },

  generateRefreshToken(payload) {
    return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiry });
  },

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwt.accessSecret);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired access token');
    }
  },

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwt.refreshSecret);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  },

  generateTokenPair(user) {
    const payload = { id: user._id || user.id, email: user.email, role: user.role };
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  },
};

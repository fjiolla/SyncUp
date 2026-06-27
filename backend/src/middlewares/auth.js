import { TokenService } from '../services/token.service.js';
import { UserRepository } from '../repositories/user.repository.js';
import { ApiError } from '../exceptions/ApiError.js';
import { asyncHandler } from './asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Access token required');
  }

  const token = authHeader.split(' ')[1];
  const decoded = TokenService.verifyAccessToken(token);
  const user = await UserRepository.findById(decoded.id);

  if (user.accountStatus !== 'active') {
    throw ApiError.forbidden('Account is not active');
  }

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw ApiError.forbidden('Insufficient permissions');
  }
  next();
};

export const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = TokenService.verifyAccessToken(token);
    const user = await UserRepository.findById(decoded.id);
    if (user && user.accountStatus === 'active') {
      req.user = user;
    }
  } catch {}
  next();
});

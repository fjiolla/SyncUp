import { asyncHandler } from '../middlewares/asyncHandler.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';
import { ApiError } from '../exceptions/ApiError.js';
import { BlockRepository } from '../repositories/block.repository.js';

export const blockUser = asyncHandler(async (req, res) => {
  if (req.params.userId === req.user._id.toString()) {
    throw ApiError.badRequest('Cannot block yourself');
  }
  const existing = await BlockRepository.findBlock(req.user._id, req.params.userId);
  if (existing) throw ApiError.conflict('User already blocked');

  await BlockRepository.create({ blocker: req.user._id, blocked: req.params.userId });
  return ResponseFormatter.success(res, { statusCode: 200, message: 'User blocked' });
});

export const unblockUser = asyncHandler(async (req, res) => {
  const result = await BlockRepository.unblock(req.user._id, req.params.userId);
  if (!result) throw ApiError.notFound('Block not found');
  return ResponseFormatter.success(res, { statusCode: 200, message: 'User unblocked' });
});

export const listBlocked = asyncHandler(async (req, res) => {
  const blocks = await BlockRepository.listBlocked(req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, data: blocks });
});

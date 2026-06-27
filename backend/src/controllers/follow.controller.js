import { FollowService } from '../services/follow.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';

export const followUser = asyncHandler(async (req, res) => {
  const follow = await FollowService.requestFollow(req.user._id, req.params.userId);
  return ResponseFormatter.success(res, { statusCode: 201, message: 'Follow request sent', data: follow });
});

export const unfollowUser = asyncHandler(async (req, res) => {
  await FollowService.unfollowUser(req.user._id, req.params.userId);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'User unfollowed' });
});

export const cancelRequest = asyncHandler(async (req, res) => {
  await FollowService.cancelRequest(req.user._id, req.params.userId);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Request cancelled' });
});

export const acceptRequest = asyncHandler(async (req, res) => {
  const follow = await FollowService.acceptRequest(req.user._id, req.params.userId);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Follow request accepted', data: follow });
});

export const declineRequest = asyncHandler(async (req, res) => {
  await FollowService.declineRequest(req.user._id, req.params.userId);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Follow request declined' });
});

export const getPendingRequests = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await FollowService.getPendingRequests(req.user._id, { page, limit });
  return ResponseFormatter.paginated(res, { message: 'Pending requests retrieved', data: result.results, pagination: result.pagination });
});

export const getFollowers = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const viewerId = req.user?._id;
  const result = await FollowService.getFollowers(viewerId, req.params.userId, { page, limit });
  return ResponseFormatter.paginated(res, { message: 'Followers retrieved', data: result.results, pagination: result.pagination });
});

export const getFollowing = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const viewerId = req.user?._id;
  const result = await FollowService.getFollowing(viewerId, req.params.userId, { page, limit });
  return ResponseFormatter.paginated(res, { message: 'Following retrieved', data: result.results, pagination: result.pagination });
});

export const getMutuals = asyncHandler(async (req, res) => {
  const viewerId = req.user?._id;
  const mutuals = await FollowService.getMutuals(viewerId, req.params.userId);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Mutuals retrieved', data: mutuals });
});

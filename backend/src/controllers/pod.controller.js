import { PodService } from '../services/pod.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';

export const createPod = asyncHandler(async (req, res) => {
  const pod = await PodService.createPod(req.user._id, req.body);
  return ResponseFormatter.success(res, { statusCode: 201, message: 'Pod created successfully', data: pod });
});

export const getPod = asyncHandler(async (req, res) => {
  const pod = await PodService.getPodBySlug(req.params.slug, req.user?._id);
  return ResponseFormatter.success(res, { statusCode: 200, data: pod });
});

export const updatePod = asyncHandler(async (req, res) => {
  const pod = await PodService.updatePod(req.params.podId, req.user._id, req.body);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Pod updated successfully', data: pod });
});

export const deletePod = asyncHandler(async (req, res) => {
  await PodService.deletePod(req.params.podId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Pod deleted successfully' });
});

export const discoverPods = asyncHandler(async (req, res) => {
  const { page, limit, category, search, sort } = req.query;
  const result = await PodService.discoverPods({ page, limit, category, search, sort });
  return ResponseFormatter.paginated(res, { message: 'Pods retrieved successfully', data: result.results, pagination: result.pagination });
});

export const getUserPods = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await PodService.getUserPods(req.user._id, { page, limit });
  return ResponseFormatter.paginated(res, { message: 'User pods retrieved successfully', data: result.results, pagination: result.pagination });
});

export const joinPod = asyncHandler(async (req, res) => {
  const result = await PodService.joinPod(req.params.podId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: result.status === 'pending' ? 'Join request submitted' : 'Joined pod successfully', data: result });
});

export const leavePod = asyncHandler(async (req, res) => {
  await PodService.leavePod(req.params.podId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Left pod successfully' });
});

export const approveMember = asyncHandler(async (req, res) => {
  await PodService.approveJoinRequest(req.params.podId, req.user._id, req.params.userId);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Member approved successfully' });
});

export const rejectMember = asyncHandler(async (req, res) => {
  await PodService.rejectJoinRequest(req.params.podId, req.user._id, req.params.userId);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Member rejected successfully' });
});

export const removeMember = asyncHandler(async (req, res) => {
  await PodService.removeMember(req.params.podId, req.user._id, req.params.userId);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Member removed successfully' });
});

export const promoteMember = asyncHandler(async (req, res) => {
  await PodService.promoteMember(req.params.podId, req.user._id, req.params.userId, req.body.role);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Member role updated successfully' });
});

export const inviteMember = asyncHandler(async (req, res) => {
  await PodService.inviteMember(req.params.podId, req.user._id, req.params.userId);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Invitation sent successfully' });
});

export const getPodMembers = asyncHandler(async (req, res) => {
  const { page, limit, role } = req.query;
  const result = await PodService.getPodMembers(req.params.podId, { page, limit, role });
  return ResponseFormatter.paginated(res, { message: 'Members retrieved successfully', data: result.results, pagination: result.pagination });
});

import { PostService } from '../services/post.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';

export const createPost = asyncHandler(async (req, res) => {
  const post = await PostService.createPost(req.user._id, req.params.podId, req.body);
  return ResponseFormatter.success(res, { statusCode: 201, message: 'Post created successfully', data: post });
});

export const getPost = asyncHandler(async (req, res) => {
  const post = await PostService.getPost(req.params.postId);
  return ResponseFormatter.success(res, { statusCode: 200, data: post });
});

export const getPodPosts = asyncHandler(async (req, res) => {
  const { page, limit, sort } = req.query;
  const result = await PostService.getPodPosts(req.params.podId, { page, limit, sort });
  return ResponseFormatter.paginated(res, { message: 'Posts retrieved successfully', data: result.results, pagination: result.pagination });
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await PostService.updatePost(req.params.postId, req.user._id, req.body);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Post updated successfully', data: post });
});

export const deletePost = asyncHandler(async (req, res) => {
  await PostService.deletePost(req.params.postId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Post deleted successfully' });
});

export const likePost = asyncHandler(async (req, res) => {
  await PostService.likePost(req.params.postId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Post liked successfully' });
});

export const unlikePost = asyncHandler(async (req, res) => {
  await PostService.unlikePost(req.params.postId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Post unliked successfully' });
});

export const savePost = asyncHandler(async (req, res) => {
  await PostService.savePost(req.params.postId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Post saved successfully' });
});

export const unsavePost = asyncHandler(async (req, res) => {
  await PostService.unsavePost(req.params.postId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Post unsaved successfully' });
});

export const getSavedPosts = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await PostService.getSavedPosts(req.user._id, { page, limit });
  return ResponseFormatter.paginated(res, { message: 'Saved posts retrieved successfully', data: result.results, pagination: result.pagination });
});

export const addComment = asyncHandler(async (req, res) => {
  const comment = await PostService.addComment(req.params.postId, req.user._id, req.body);
  return ResponseFormatter.success(res, { statusCode: 201, message: 'Comment added successfully', data: comment });
});

export const getComments = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await PostService.getComments(req.params.postId, { page, limit });
  return ResponseFormatter.paginated(res, { message: 'Comments retrieved successfully', data: result.results, pagination: result.pagination });
});

export const getReplies = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await PostService.getReplies(req.params.commentId, { page, limit });
  return ResponseFormatter.paginated(res, { message: 'Replies retrieved successfully', data: result.results, pagination: result.pagination });
});

export const deleteComment = asyncHandler(async (req, res) => {
  await PostService.deleteComment(req.params.commentId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Comment deleted successfully' });
});

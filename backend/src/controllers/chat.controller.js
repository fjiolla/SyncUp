import { ChatService } from '../services/chat.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';

export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const conversation = await ChatService.getOrCreateConversation(req.user._id, req.params.targetUserId);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Conversation retrieved', data: conversation });
});

export const getUserConversations = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await ChatService.getUserConversations(req.user._id, { page, limit });
  return ResponseFormatter.paginated(res, { message: 'Conversations retrieved', data: result.results, pagination: result.pagination });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const message = await ChatService.sendMessage(req.params.conversationId, req.user._id, req.body);
  return ResponseFormatter.success(res, { statusCode: 201, message: 'Message sent', data: message });
});

export const getMessages = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await ChatService.getMessages(req.params.conversationId, req.user._id, { page, limit });
  return ResponseFormatter.paginated(res, { message: 'Messages retrieved', data: result.results, pagination: result.pagination });
});

export const markAsRead = asyncHandler(async (req, res) => {
  await ChatService.markAsRead(req.params.conversationId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Messages marked as read' });
});

export const acceptConversation = asyncHandler(async (req, res) => {
  const conversation = await ChatService.acceptConversation(req.params.conversationId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Message request accepted', data: conversation });
});

export const declineConversation = asyncHandler(async (req, res) => {
  await ChatService.declineConversation(req.params.conversationId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Message request declined' });
});

export const deleteMessageForMe = asyncHandler(async (req, res) => {
  await ChatService.deleteMessageForMe(req.params.messageId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Message deleted' });
});

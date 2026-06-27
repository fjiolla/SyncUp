import { NotificationService } from '../services/notification.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';

export const getUserNotifications = asyncHandler(async (req, res) => {
  const { page, limit, isRead } = req.query;
  const parsedIsRead = isRead === 'true' ? true : isRead === 'false' ? false : undefined;
  const result = await NotificationService.getUserNotifications(req.user._id, { page, limit, isRead: parsedIsRead });
  return ResponseFormatter.paginated(res, { message: 'Notifications retrieved', data: result.results, pagination: result.pagination });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await NotificationService.getUnreadCount(req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Unread count retrieved', data: { count } });
});

export const markAsRead = asyncHandler(async (req, res) => {
  await NotificationService.markAsRead(req.params.notificationId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Notification marked as read' });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await NotificationService.markAllAsRead(req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'All notifications marked as read' });
});

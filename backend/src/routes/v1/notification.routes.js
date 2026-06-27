import { Router } from 'express';
import * as notificationController from '../../controllers/notification.controller.js';
import { protect } from '../../middlewares/auth.js';

const router = Router();

router.get('/', protect, notificationController.getUserNotifications);
router.get('/unread-count', protect, notificationController.getUnreadCount);
router.patch('/:notificationId/read', protect, notificationController.markAsRead);
router.patch('/read-all', protect, notificationController.markAllAsRead);

export default router;

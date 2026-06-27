import { NotificationRepository } from '../repositories/notification.repository.js';

export const NotificationService = {
  async createNotification({ recipient, sender, type, title, body, referenceId, referenceType, referenceSlug }) {
    return NotificationRepository.create({
      recipient,
      sender,
      type,
      title,
      body,
      referenceId,
      referenceType,
      referenceSlug,
    });
  },

  async getUserNotifications(userId, { page = 1, limit = 20, isRead } = {}) {
    return NotificationRepository.findByRecipient(userId, { page, limit, isRead });
  },

  async markAsRead(notificationId, userId) {
    return NotificationRepository.markAsRead(notificationId, userId);
  },

  async markAllAsRead(userId) {
    return NotificationRepository.markAllAsRead(userId);
  },

  async getUnreadCount(userId) {
    return NotificationRepository.getUnreadCount(userId);
  },
};

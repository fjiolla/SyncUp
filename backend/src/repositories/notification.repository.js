import { BaseRepository } from './base.repository.js';
import { Notification } from '../models/notification.model.js';

class NotificationRepositoryClass extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async findByRecipient(userId, { page = 1, limit = 20, isRead } = {}) {
    const filter = { recipient: userId };
    if (typeof isRead === 'boolean') filter.isRead = isRead;

    const total = await this.model.countDocuments(filter);
    const skip = (page - 1) * limit;

    const results = await this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'fullName username profileImage')
      .lean();

    return {
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async markAsRead(notificationId, userId) {
    return this.model.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return this.model.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  }

  async getUnreadCount(userId) {
    return this.model.countDocuments({ recipient: userId, isRead: false });
  }

  async deleteWhere(filter) {
    return this.model.deleteMany(filter);
  }
}

export const NotificationRepository = new NotificationRepositoryClass();

import { BaseRepository } from './base.repository.js';
import { Message } from '../models/message.model.js';

class MessageRepositoryClass extends BaseRepository {
  constructor() {
    super(Message);
  }

  async findByConversation(conversationId, { page = 1, limit = 50 } = {}) {
    const total = await this.model.countDocuments({ conversation: conversationId });
    const skip = (page - 1) * limit;

    const results = await this.model
      .find({ conversation: conversationId })
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

  async markAsRead(conversationId, userId) {
    return this.model.updateMany(
      { conversation: conversationId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );
  }
}

export const MessageRepository = new MessageRepositoryClass();

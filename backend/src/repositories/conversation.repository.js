import { BaseRepository } from './base.repository.js';
import { Conversation } from '../models/conversation.model.js';

class ConversationRepositoryClass extends BaseRepository {
  constructor() {
    super(Conversation);
  }

  async findByParticipants(userId1, userId2) {
    return this.model.findOne({
      type: 'direct',
      participants: { $all: [userId1, userId2], $size: 2 },
    }).lean();
  }

  async findUserConversations(userId, { page = 1, limit = 20 } = {}) {
    const total = await this.model.countDocuments({ participants: userId });
    const skip = (page - 1) * limit;

    const results = await this.model
      .find({ participants: userId })
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('participants', 'fullName username profileImage')
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
}

export const ConversationRepository = new ConversationRepositoryClass();

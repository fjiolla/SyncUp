import { BaseRepository } from './base.repository.js';
import { Comment } from '../models/comment.model.js';

class CommentRepositoryClass extends BaseRepository {
  constructor() {
    super(Comment);
  }

  async findByPost(postId, { page = 1, limit = 10 } = {}) {
    const filter = { post: postId, parentComment: null, deletedAt: null };
    const total = await this.model.countDocuments(filter);
    const skip = (page - 1) * limit;

    const results = await this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort('-createdAt')
      .populate('user', 'fullName username profileImage')
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

  async findReplies(commentId, { page = 1, limit = 10 } = {}) {
    const filter = { parentComment: commentId, deletedAt: null };
    const total = await this.model.countDocuments(filter);
    const skip = (page - 1) * limit;

    const results = await this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort('createdAt')
      .populate('user', 'fullName username profileImage')
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

export const CommentRepository = new CommentRepositoryClass();

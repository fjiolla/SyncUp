import { BaseRepository } from './base.repository.js';
import { Follow } from '../models/follow.model.js';

class FollowRepositoryClass extends BaseRepository {
  constructor() {
    super(Follow);
  }

  async findFollow(followerId, followingId) {
    return this.model.findOne({ follower: followerId, following: followingId }).lean();
  }

  async getFollowers(userId, { page = 1, limit = 20, status = 'accepted' } = {}) {
    const filter = { following: userId };
    if (status === 'accepted') {
      filter.$or = [{ status: 'accepted' }, { status: { $exists: false } }, { status: null }];
    } else if (status) {
      filter.status = status;
    }
    const total = await this.model.countDocuments(filter);
    const skip = (page - 1) * limit;

    const results = await this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('follower', 'fullName username profileImage')
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

  async getFollowing(userId, { page = 1, limit = 20, status = 'accepted' } = {}) {
    const filter = { follower: userId };
    if (status === 'accepted') {
      filter.$or = [{ status: 'accepted' }, { status: { $exists: false } }, { status: null }];
    } else if (status) {
      filter.status = status;
    }
    const total = await this.model.countDocuments(filter);
    const skip = (page - 1) * limit;

    const results = await this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('following', 'fullName username profileImage')
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

  async getPendingRequests(userId, { page = 1, limit = 20 } = {}) {
    return this.getFollowers(userId, { page, limit, status: 'pending' });
  }

  async getFollowerCount(userId) {
    return this.model.countDocuments({
      following: userId,
      $or: [{ status: 'accepted' }, { status: { $exists: false } }, { status: null }],
    });
  }

  async getFollowingCount(userId) {
    return this.model.countDocuments({
      follower: userId,
      $or: [{ status: 'accepted' }, { status: { $exists: false } }, { status: null }],
    });
  }

  async getMutuals(viewerId, profileUserId, { limit = 20 } = {}) {
    const viewerFollowing = await this.model
      .find({
        follower: viewerId,
        $or: [{ status: 'accepted' }, { status: { $exists: false } }, { status: null }],
      })
      .select('following')
      .lean();
    const viewerFollowingIds = viewerFollowing.map((f) => f.following);

    const mutuals = await this.model
      .find({
        follower: profileUserId,
        following: { $in: viewerFollowingIds },
        $or: [{ status: 'accepted' }, { status: { $exists: false } }, { status: null }],
      })
      .limit(limit)
      .populate('following', 'fullName username profileImage')
      .lean();

    return mutuals.map((m) => m.following);
  }
}

export const FollowRepository = new FollowRepositoryClass();

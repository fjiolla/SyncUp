import { BaseRepository } from './base.repository.js';
import { Pod } from '../models/pod.model.js';

class PodRepositoryClass extends BaseRepository {
  constructor() {
    super(Pod);
  }

  async findBySlug(slug) {
    return this.model.findOne({ slug, deletedAt: null })
      .populate('owner', 'fullName username profileImage isEmailVerified')
      .lean();
  }

  async findByOwner(userId) {
    return this.model.find({ owner: userId, deletedAt: null }).lean();
  }

  async findByCategory(category) {
    return this.model.find({ category, deletedAt: null }).lean();
  }

  async searchPods(query, { page = 1, limit = 10, sort = '-createdAt' } = {}) {
    const filter = { deletedAt: null, status: 'active', visibility: 'public' };

    if (query) {
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: regex },
        { description: regex },
        { category: regex },
        { tags: regex },
      ];
    }

    const total = await this.model.countDocuments(filter);
    const skip = (page - 1) * limit;

    const results = await this.model
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
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

  async incrementMemberCount(podId) {
    return this.model.findByIdAndUpdate(podId, { $inc: { memberCount: 1 } }, { new: true });
  }

  async markEndedAsCompleted() {
    const now = new Date();
    const result = await this.model.updateMany(
      { status: 'active', endDate: { $ne: null, $lt: now } },
      { $set: { status: 'completed' } }
    );
    return result.modifiedCount || 0;
  }

  async decrementMemberCount(podId) {
    return this.model.findByIdAndUpdate(podId, { $inc: { memberCount: -1 } }, { new: true });
  }

  _parseSortString(sort) {
    if (typeof sort === 'string') {
      const result = {};
      const fields = sort.split(' ');
      for (const field of fields) {
        if (field.startsWith('-')) {
          result[field.substring(1)] = -1;
        } else {
          result[field] = 1;
        }
      }
      return result;
    }
    return sort;
  }
}

export const PodRepository = new PodRepositoryClass();

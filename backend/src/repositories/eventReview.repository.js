import mongoose from 'mongoose';
import { BaseRepository } from './base.repository.js';
import { EventReview } from '../models/eventReview.model.js';

class EventReviewRepositoryClass extends BaseRepository {
  constructor() {
    super(EventReview);
  }

  async findByEventAndUser(eventId, userId) {
    return this.model.findOne({ event: eventId, reviewer: userId }).lean();
  }

  async listForEvent(eventId, { page = 1, limit = 20 } = {}) {
    const total = await this.model.countDocuments({ event: eventId });
    const skip = (page - 1) * limit;
    const results = await this.model.find({ event: eventId })
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit)
      .populate('reviewer', 'fullName username profileImage')
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

  async listForPod(podId, { page = 1, limit = 20 } = {}) {
    const total = await this.model.countDocuments({ pod: podId });
    const skip = (page - 1) * limit;
    const results = await this.model.find({ pod: podId })
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit)
      .populate('reviewer', 'fullName username profileImage')
      .populate('event', 'title startDate')
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

  async getPodStats(podId) {
    const result = await this.model.aggregate([
      { $match: { pod: new mongoose.Types.ObjectId(podId) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (result.length === 0) return { averageRating: 0, reviewCount: 0 };
    return { averageRating: Math.round(result[0].avg * 10) / 10, reviewCount: result[0].count };
  }

  async getEventStats(eventId) {
    const result = await this.model.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(eventId) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (result.length === 0) return { averageRating: 0, reviewCount: 0 };
    return { averageRating: Math.round(result[0].avg * 10) / 10, reviewCount: result[0].count };
  }
}

export const EventReviewRepository = new EventReviewRepositoryClass();

import { BaseRepository } from './base.repository.js';
import { Report } from '../models/report.model.js';

class ReportRepositoryClass extends BaseRepository {
  constructor() { super(Report); }

  async findExisting(reporterId, targetType, targetId) {
    return this.model.findOne({ reporter: reporterId, targetType, targetId, status: { $in: ['pending', 'reviewing'] } }).lean();
  }

  async listByStatus({ page = 1, limit = 20, status } = {}) {
    const filter = status ? { status } : {};
    const total = await this.model.countDocuments(filter);
    const skip = (page - 1) * limit;
    const results = await this.model.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit)
      .populate('reporter', 'fullName username profileImage')
      .lean();
    return {
      results,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page < Math.ceil(total / limit), hasPrevPage: page > 1 },
    };
  }
}

export const ReportRepository = new ReportRepositoryClass();

import { BaseRepository } from './base.repository.js';
import { PodMember } from '../models/podMember.model.js';

class PodMemberRepositoryClass extends BaseRepository {
  constructor() {
    super(PodMember);
  }

  async findMembership(podId, userId) {
    return this.model.findOne({ pod: podId, user: userId }).lean();
  }

  async findPodMembers(podId, { page = 1, limit = 20, role, status = 'approved' } = {}) {
    const filter = { pod: podId, status };
    if (role) filter.role = role;

    const total = await this.model.countDocuments(filter);
    const skip = (page - 1) * limit;

    const results = await this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
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

  async findUserPods(userId, { page = 1, limit = 10 } = {}) {
    const filter = { user: userId, status: 'approved' };

    const skip = (page - 1) * limit;

    const allMatching = await this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .populate({ path: 'pod', match: { deletedAt: null } })
      .lean();

    const results = allMatching.filter((m) => m.pod);
    const total = results.length === limit
      ? await this.model.countDocuments(filter)
      : skip + results.length;

    return {
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: results.length === limit,
        hasPrevPage: page > 1,
      },
    };
  }

  async updateRole(podId, userId, role) {
    return this.model.findOneAndUpdate(
      { pod: podId, user: userId },
      { role },
      { new: true }
    ).lean();
  }

  async updateStatus(podId, userId, status) {
    return this.model.findOneAndUpdate(
      { pod: podId, user: userId },
      { status },
      { new: true }
    ).lean();
  }
}

export const PodMemberRepository = new PodMemberRepositoryClass();

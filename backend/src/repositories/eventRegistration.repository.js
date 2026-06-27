import { BaseRepository } from './base.repository.js';
import { EventRegistration } from '../models/eventRegistration.model.js';

class EventRegistrationRepositoryClass extends BaseRepository {
  constructor() {
    super(EventRegistration);
  }

  async findRegistration(eventId, userId) {
    return this.model.findOne({ event: eventId, user: userId }).lean();
  }

  async findEventAttendees(eventId, { page = 1, limit = 20 } = {}) {
    const filter = { event: eventId, status: 'registered' };
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

  async findUserEvents(userId, { page = 1, limit = 10 } = {}) {
    const filter = { user: userId, status: 'registered' };
    const total = await this.model.countDocuments(filter);
    const skip = (page - 1) * limit;

    const results = await this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .populate({ path: 'event', populate: { path: 'pod', select: 'name slug icon' } })
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

export const EventRegistrationRepository = new EventRegistrationRepositoryClass();

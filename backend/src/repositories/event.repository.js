import { BaseRepository } from './base.repository.js';
import { Event } from '../models/event.model.js';

class EventRepositoryClass extends BaseRepository {
  constructor() {
    super(Event);
  }

  async findByPod(podId, { page = 1, limit = 10 } = {}) {
    const filter = { pod: podId, deletedAt: null };
    const total = await this.model.countDocuments(filter);
    const skip = (page - 1) * limit;

    const results = await this.model
      .find(filter)
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('organizer', 'fullName username profileImage')
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

  async findUpcoming({ page = 1, limit = 10 } = {}) {
    const filter = { startDate: { $gt: new Date() }, status: 'upcoming', deletedAt: null };
    const total = await this.model.countDocuments(filter);
    const skip = (page - 1) * limit;

    const results = await this.model
      .find(filter)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit)
      .populate('organizer', 'fullName username profileImage')
      .populate('pod', 'name slug icon')
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

  async incrementAttendeeCount(eventId) {
    return this.model.findByIdAndUpdate(eventId, { $inc: { attendeeCount: 1 } }, { new: true });
  }

  /**
   * Atomically reserves a capacity slot. The increment only applies if the
   * event is not cancelled and still has room, preventing overbooking under
   * concurrent registrations. Returns the updated event, or null if full.
   */
  async reserveSlot(eventId) {
    return this.model.findOneAndUpdate(
      {
        _id: eventId,
        deletedAt: null,
        status: { $ne: 'cancelled' },
        $expr: { $lt: ['$attendeeCount', '$maxParticipants'] },
      },
      { $inc: { attendeeCount: 1 } },
      { new: true }
    );
  }

  async decrementAttendeeCount(eventId) {
    // Guard against the count going negative if a decrement is ever called
    // without a matching active registration.
    return this.model.findOneAndUpdate(
      { _id: eventId, attendeeCount: { $gt: 0 } },
      { $inc: { attendeeCount: -1 } },
      { new: true }
    );
  }

  async findByDateRange(startDate, endDate, filter = {}) {
    const query = {
      ...filter,
      startDate: { $gte: new Date(startDate) },
      endDate: { $lte: new Date(endDate) },
      deletedAt: null,
    };

    return this.model
      .find(query)
      .sort({ startDate: 1 })
      .populate('organizer', 'fullName username profileImage')
      .populate('pod', 'name slug icon')
      .lean();
  }
}

export const EventRepository = new EventRepositoryClass();

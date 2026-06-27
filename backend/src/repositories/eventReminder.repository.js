import { BaseRepository } from './base.repository.js';
import { EventReminder } from '../models/eventReminder.model.js';

class EventReminderRepositoryClass extends BaseRepository {
  constructor() {
    super(EventReminder);
  }

  async findReminder(eventId, userId) {
    return this.model.findOne({ event: eventId, user: userId }).lean();
  }

  async findUserReminders(userId) {
    return this.model
      .find({ user: userId })
      .sort({ reminderDate: 1 })
      .populate({
        path: 'event',
        select: 'title startDate endDate location eventType pod banner',
        populate: { path: 'pod', select: 'name slug icon' },
      })
      .lean();
  }

  async findDueReminders() {
    return this.model
      .find({ reminderDate: { $lte: new Date() }, notified: false })
      .populate('user', 'fullName email')
      .populate('event', 'title startDate location')
      .lean();
  }

  async removeReminder(eventId, userId) {
    return this.model.findOneAndDelete({ event: eventId, user: userId });
  }
}

export const EventReminderRepository = new EventReminderRepositoryClass();

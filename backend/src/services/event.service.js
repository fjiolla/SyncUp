import { EventRepository } from '../repositories/event.repository.js';
import { EventRegistrationRepository } from '../repositories/eventRegistration.repository.js';
import { PodMemberRepository } from '../repositories/podMember.repository.js';
import { EventReminderRepository } from '../repositories/eventReminder.repository.js';
import { EventReviewRepository } from '../repositories/eventReview.repository.js';
import { Event } from '../models/event.model.js';
import { PodMember } from '../models/podMember.model.js';
import { ApiError } from '../exceptions/ApiError.js';
import { NotificationService } from './notification.service.js';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const verifyPodRole = async (podId, userId, allowedRoles) => {
  const membership = await PodMemberRepository.findMembership(podId, userId);
  if (!membership || membership.status !== 'approved' || !allowedRoles.includes(membership.role)) {
    throw ApiError.forbidden('You do not have permission to perform this action');
  }
  return membership.role;
};

export const EventService = {
  async createEvent(userId, podId, data) {
    await verifyPodRole(podId, userId, ['owner', 'admin', 'moderator']);
    return EventRepository.create({ ...data, pod: podId, organizer: userId });
  },

  async getEvent(eventId) {
    const [event, stats] = await Promise.all([
      EventRepository.findById(eventId, {
        populate: [
          { path: 'organizer', select: 'fullName username profileImage' },
          { path: 'pod', select: 'name slug icon' },
        ],
      }),
      EventReviewRepository.getEventStats(eventId),
    ]);
    return { ...event, ratingStats: stats };
  },

  async getPodEvents(podId, { page, limit } = {}) {
    return EventRepository.findByPod(podId, { page, limit });
  },

  async updateEvent(eventId, userId, data) {
    const event = await EventRepository.findById(eventId);
    if (event.organizer.toString() !== userId.toString()) {
      await verifyPodRole(event.pod.toString(), userId, ['owner', 'admin']);
    }
    return EventRepository.update(eventId, data);
  },

  async cancelEvent(eventId, userId) {
    const event = await EventRepository.findById(eventId);
    if (event.organizer.toString() !== userId.toString()) {
      await verifyPodRole(event.pod.toString(), userId, ['owner', 'admin']);
    }
    return EventRepository.update(eventId, { status: 'cancelled' });
  },

  async registerForEvent(eventId, userId) {
    const event = await EventRepository.findById(eventId);

    if (event.status === 'cancelled') {
      throw ApiError.badRequest('This event has been cancelled');
    }
    if (event.attendeeCount >= event.maxParticipants) {
      throw ApiError.badRequest('This event is full');
    }
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      throw ApiError.badRequest('Registration deadline has passed');
    }

    const existing = await EventRegistrationRepository.findRegistration(eventId, userId);
    if (existing && existing.status === 'registered') {
      throw ApiError.conflict('You are already registered for this event');
    }

    if (existing && existing.status === 'cancelled') {
      await EventRegistrationRepository.model.findByIdAndUpdate(existing._id, { status: 'registered', registeredAt: new Date() });
    } else {
      await EventRegistrationRepository.create({ event: eventId, user: userId });
    }

    await EventRepository.incrementAttendeeCount(eventId);
    return { status: 'registered' };
  },

  async cancelRegistration(eventId, userId) {
    const existing = await EventRegistrationRepository.findRegistration(eventId, userId);
    if (!existing || existing.status !== 'registered') {
      throw ApiError.badRequest('You are not registered for this event');
    }
    await EventRegistrationRepository.model.findByIdAndUpdate(existing._id, { status: 'cancelled' });
    await EventRepository.decrementAttendeeCount(eventId);
    return { status: 'cancelled' };
  },

  async getEventAttendees(eventId, { page, limit } = {}) {
    return EventRegistrationRepository.findEventAttendees(eventId, { page, limit });
  },

  async getUserEvents(userId, { page, limit } = {}) {
    return EventRegistrationRepository.findUserEvents(userId, { page, limit });
  },

  async getUpcomingEvents({ page, limit } = {}) {
    return EventRepository.findUpcoming({ page, limit });
  },

  async setEventReminder(eventId, userId) {
    const event = await EventRepository.findById(eventId);
    const existing = await EventReminderRepository.findReminder(eventId, userId);

    if (existing) {
      throw ApiError.conflict('Reminder already set for this event');
    }

    const reminderDate = new Date(new Date(event.startDate).getTime() - THREE_DAYS_MS);
    const reminder = await EventReminderRepository.create({ event: eventId, user: userId, reminderDate });

    await NotificationService.createNotification({
      recipient: userId,
      type: 'event_update',
      title: 'Reminder set',
      body: `You'll be reminded 3 days before "${event.title}"`,
      referenceId: eventId,
      referenceType: 'Event',
    });

    return reminder;
  },

  async removeEventReminder(eventId, userId) {
    const existing = await EventReminderRepository.findReminder(eventId, userId);
    if (!existing) {
      throw ApiError.notFound('Reminder not found');
    }
    await EventReminderRepository.removeReminder(eventId, userId);
    return { removed: true };
  },

  async getUserEventReminder(eventId, userId) {
    return EventReminderRepository.findReminder(eventId, userId);
  },

  async getUserReminders(userId) {
    return EventReminderRepository.findUserReminders(userId);
  },

  async getEventsByDate(startOfDay, endOfDay) {
    return Event.find({
      startDate: { $gte: startOfDay, $lte: endOfDay },
      deletedAt: null,
    })
      .sort({ startDate: 1 })
      .populate('pod', 'name slug icon')
      .populate('organizer', 'fullName username profileImage')
      .lean();
  },

  async getEventsByMonth(year, month) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    return Event.find({
      startDate: { $gte: startOfMonth, $lte: endOfMonth },
      deletedAt: null,
    })
      .sort({ startDate: 1 })
      .populate('pod', 'name slug icon')
      .populate('organizer', 'fullName username profileImage')
      .lean();
  },
};

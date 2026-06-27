import { asyncHandler } from '../middlewares/asyncHandler.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';
import { ApiError } from '../exceptions/ApiError.js';
import { EventReviewRepository } from '../repositories/eventReview.repository.js';
import { EventRepository } from '../repositories/event.repository.js';
import { EventRegistrationRepository } from '../repositories/eventRegistration.repository.js';

export const createReview = asyncHandler(async (req, res) => {
  const event = await EventRepository.findById(req.params.eventId);

  if (new Date(event.endDate) > new Date()) {
    throw ApiError.badRequest('You can only review events after they have ended');
  }

  const registration = await EventRegistrationRepository.findRegistration(event._id, req.user._id);
  if (!registration || registration.status === 'cancelled') {
    throw ApiError.forbidden('Only attendees can review this event');
  }

  const existing = await EventReviewRepository.findByEventAndUser(event._id, req.user._id);
  if (existing) {
    throw ApiError.conflict('You already reviewed this event');
  }

  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    throw ApiError.badRequest('Rating must be between 1 and 5');
  }

  const review = await EventReviewRepository.create({
    event: event._id,
    pod: event.pod,
    reviewer: req.user._id,
    rating,
    comment: comment || '',
  });

  return ResponseFormatter.success(res, { statusCode: 201, message: 'Review submitted', data: review });
});

export const getEventReviews = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await EventReviewRepository.listForEvent(req.params.eventId, { page, limit });
  const stats = await EventReviewRepository.getEventStats(req.params.eventId);
  return ResponseFormatter.success(res, {
    statusCode: 200,
    data: { ...result, stats },
  });
});

export const getPodReviews = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await EventReviewRepository.listForPod(req.params.podId, { page, limit });
  const stats = await EventReviewRepository.getPodStats(req.params.podId);
  return ResponseFormatter.success(res, {
    statusCode: 200,
    data: { ...result, stats },
  });
});

export const getMyReview = asyncHandler(async (req, res) => {
  const review = await EventReviewRepository.findByEventAndUser(req.params.eventId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, data: review });
});

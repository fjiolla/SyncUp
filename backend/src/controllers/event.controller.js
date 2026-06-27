import { EventService } from '../services/event.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';

export const createEvent = asyncHandler(async (req, res) => {
  const event = await EventService.createEvent(req.user._id, req.params.podId, req.body);
  return ResponseFormatter.success(res, { statusCode: 201, message: 'Event created successfully', data: event });
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await EventService.getEvent(req.params.eventId);
  return ResponseFormatter.success(res, { statusCode: 200, data: event });
});

export const getPodEvents = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await EventService.getPodEvents(req.params.podId, { page, limit });
  return ResponseFormatter.paginated(res, { message: 'Pod events retrieved successfully', data: result.results, pagination: result.pagination });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await EventService.updateEvent(req.params.eventId, req.user._id, req.body);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Event updated successfully', data: event });
});

export const cancelEvent = asyncHandler(async (req, res) => {
  await EventService.cancelEvent(req.params.eventId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Event cancelled successfully' });
});

export const registerForEvent = asyncHandler(async (req, res) => {
  const result = await EventService.registerForEvent(req.params.eventId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Registered for event successfully', data: result });
});

export const cancelRegistration = asyncHandler(async (req, res) => {
  const result = await EventService.cancelRegistration(req.params.eventId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Registration cancelled successfully', data: result });
});

export const getEventAttendees = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await EventService.getEventAttendees(req.params.eventId, { page, limit });
  return ResponseFormatter.paginated(res, { message: 'Attendees retrieved successfully', data: result.results, pagination: result.pagination });
});

export const getUserEvents = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await EventService.getUserEvents(req.user._id, { page, limit });
  return ResponseFormatter.paginated(res, { message: 'User events retrieved successfully', data: result.results, pagination: result.pagination });
});

export const getUpcomingEvents = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await EventService.getUpcomingEvents({ page, limit });
  return ResponseFormatter.paginated(res, { message: 'Upcoming events retrieved successfully', data: result.results, pagination: result.pagination });
});

export const setEventReminder = asyncHandler(async (req, res) => {
  const reminder = await EventService.setEventReminder(req.params.eventId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Reminder set successfully', data: reminder });
});

export const removeEventReminder = asyncHandler(async (req, res) => {
  await EventService.removeEventReminder(req.params.eventId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Reminder removed successfully' });
});

export const getUserEventReminder = asyncHandler(async (req, res) => {
  const reminder = await EventService.getUserEventReminder(req.params.eventId, req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, data: reminder });
});

export const getUserReminders = asyncHandler(async (req, res) => {
  const reminders = await EventService.getUserReminders(req.user._id);
  return ResponseFormatter.success(res, { statusCode: 200, data: reminders });
});

export const getEventsByMonth = asyncHandler(async (req, res) => {
  const year = parseInt(req.params.year, 10);
  const month = parseInt(req.params.month, 10);
  const events = await EventService.getEventsByMonth(year, month);
  return ResponseFormatter.success(res, { statusCode: 200, data: events });
});

export const getEventsByDay = asyncHandler(async (req, res) => {
  const year = parseInt(req.params.year, 10);
  const month = parseInt(req.params.month, 10);
  const day = parseInt(req.params.day, 10);
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59);
  const events = await EventService.getEventsByDate(startOfDay, endOfDay);
  return ResponseFormatter.success(res, { statusCode: 200, data: events });
});

import { Router } from 'express';
import * as eventController from '../../controllers/event.controller.js';
import { validate } from '../../middlewares/validate.js';
import { protect } from '../../middlewares/auth.js';
import { createEventSchema, updateEventSchema, eventIdParamSchema, paginationSchema } from '../../validators/event.validator.js';

const router = Router();

router.get('/events/calendar/:year/:month/:day', eventController.getEventsByDay);
router.get('/events/calendar/:year/:month', eventController.getEventsByMonth);
router.get('/events/reminders', protect, eventController.getUserReminders);
router.get('/events/upcoming', validate(paginationSchema), eventController.getUpcomingEvents);
router.get('/events/my-events', protect, eventController.getUserEvents);

router.post('/pods/:podId/events', protect, validate(createEventSchema), eventController.createEvent);
router.get('/pods/:podId/events', validate(paginationSchema), eventController.getPodEvents);

router.post('/events/:eventId/reminder', protect, eventController.setEventReminder);
router.delete('/events/:eventId/reminder', protect, eventController.removeEventReminder);
router.get('/events/:eventId/reminder', protect, eventController.getUserEventReminder);

router.get('/events/:eventId', validate(eventIdParamSchema), eventController.getEvent);
router.patch('/events/:eventId', protect, validate(updateEventSchema), eventController.updateEvent);
router.post('/events/:eventId/cancel', protect, validate(eventIdParamSchema), eventController.cancelEvent);
router.post('/events/:eventId/register', protect, validate(eventIdParamSchema), eventController.registerForEvent);
router.post('/events/:eventId/cancel-registration', protect, validate(eventIdParamSchema), eventController.cancelRegistration);
router.get('/events/:eventId/attendees', validate(eventIdParamSchema), eventController.getEventAttendees);

export default router;

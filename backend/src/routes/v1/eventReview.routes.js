import { Router } from 'express';
import * as reviewController from '../../controllers/eventReview.controller.js';
import { protect } from '../../middlewares/auth.js';

const router = Router();

router.post('/events/:eventId/reviews', protect, reviewController.createReview);
router.get('/events/:eventId/reviews', reviewController.getEventReviews);
router.get('/events/:eventId/my-review', protect, reviewController.getMyReview);
router.get('/pods/:podId/reviews', reviewController.getPodReviews);

export default router;

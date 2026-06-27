import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import podRoutes from './pod.routes.js';
import postRoutes from './post.routes.js';
import eventRoutes from './event.routes.js';
import eventReviewRoutes from './eventReview.routes.js';
import chatRoutes from './chat.routes.js';
import notificationRoutes from './notification.routes.js';
import followRoutes from './follow.routes.js';
import searchRoutes from './search.routes.js';
import userRoutes from './user.routes.js';
import reportRoutes from './report.routes.js';
import blockRoutes from './block.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/pods', podRoutes);
router.use('/', postRoutes);
router.use('/', eventRoutes);
router.use('/', eventReviewRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/', followRoutes);
router.use('/', searchRoutes);
router.use('/', userRoutes);
router.use('/', reportRoutes);
router.use('/', blockRoutes);
router.use('/', adminRoutes);

export default router;

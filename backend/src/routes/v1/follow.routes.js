import { Router } from 'express';
import * as followController from '../../controllers/follow.controller.js';
import { protect, optionalAuth } from '../../middlewares/auth.js';

const router = Router();

router.post('/users/:userId/follow', protect, followController.followUser);
router.delete('/users/:userId/follow', protect, followController.unfollowUser);
router.delete('/users/:userId/follow/cancel', protect, followController.cancelRequest);
router.post('/users/:userId/follow/accept', protect, followController.acceptRequest);
router.post('/users/:userId/follow/decline', protect, followController.declineRequest);

router.get('/follow-requests', protect, followController.getPendingRequests);

router.get('/users/:userId/followers', optionalAuth, followController.getFollowers);
router.get('/users/:userId/following', optionalAuth, followController.getFollowing);
router.get('/users/:userId/mutuals', optionalAuth, followController.getMutuals);

export default router;

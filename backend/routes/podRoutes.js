import express from 'express';
import { getPods, getPodsByUser, createPod, joinPod, leavePod, deletePod } from '../controllers/podController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getPods).post(protect, createPod);
router.route('/user/:id').get(getPodsByUser);
router.route('/:id').delete(protect, deletePod);
router.route('/:id/join').post(protect, joinPod);
router.route('/:id/leave').post(protect, leavePod);

export default router;

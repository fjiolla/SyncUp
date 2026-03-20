import express from 'express';
import { getUsers, getPods, getReports } from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/users', protect, isAdmin, getUsers);
router.get('/pods', protect, isAdmin, getPods);
router.get('/reports', protect, isAdmin, getReports);

export default router;

import express from 'express';
import { getUsers, getPods, getReports, resolveReport, deletePodAsAdmin } from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/users', protect, isAdmin, getUsers);
router.get('/pods', protect, isAdmin, getPods);
router.get('/reports', protect, isAdmin, getReports);
router.put('/reports/:id', protect, isAdmin, resolveReport);
router.delete('/pods/:id', protect, isAdmin, deletePodAsAdmin);

export default router;

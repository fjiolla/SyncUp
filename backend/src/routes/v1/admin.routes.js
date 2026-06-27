import { Router } from 'express';
import * as adminController from '../../controllers/admin.controller.js';
import { protect, authorize } from '../../middlewares/auth.js';

const router = Router();

router.use('/admin', protect, authorize('admin', 'superadmin'));
router.get('/admin/stats', adminController.getStats);
router.get('/admin/users', adminController.listUsers);
router.patch('/admin/users/:userId/status', adminController.updateUserStatus);

export default router;

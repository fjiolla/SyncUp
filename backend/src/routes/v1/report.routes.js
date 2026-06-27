import { Router } from 'express';
import * as reportController from '../../controllers/report.controller.js';
import { protect, authorize } from '../../middlewares/auth.js';

const router = Router();

router.post('/reports', protect, reportController.createReport);
router.get('/reports', protect, authorize('admin', 'superadmin'), reportController.listReports);
router.patch('/reports/:reportId', protect, authorize('admin', 'superadmin'), reportController.resolveReport);

export default router;

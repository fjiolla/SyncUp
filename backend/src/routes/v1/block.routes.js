import { Router } from 'express';
import * as blockController from '../../controllers/block.controller.js';
import { protect } from '../../middlewares/auth.js';

const router = Router();

router.post('/blocks/:userId', protect, blockController.blockUser);
router.delete('/blocks/:userId', protect, blockController.unblockUser);
router.get('/blocks', protect, blockController.listBlocked);

export default router;

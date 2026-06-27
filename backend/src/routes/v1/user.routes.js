import { Router } from 'express';
import * as userController from '../../controllers/user.controller.js';
import { optionalAuth } from '../../middlewares/auth.js';

const router = Router();

router.get('/users/:username', optionalAuth, userController.getUserByUsername);

export default router;

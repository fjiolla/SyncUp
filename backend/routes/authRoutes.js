import express from 'express';
import { loginUser, registerUser, logoutUser, verifyEmail, resendVerification } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/verify/:token', verifyEmail);
router.post('/resend', resendVerification);

export default router;

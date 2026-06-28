import { Router } from 'express';
import passport from 'passport';
import * as authController from '../../controllers/auth.controller.js';
import { validate } from '../../middlewares/validate.js';
import { protect } from '../../middlewares/auth.js';
import { authRateLimiter } from '../../middlewares/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../../validators/auth.validator.js';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.post('/send-verification-email', protect, authController.sendVerificationEmail);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.get('/me', protect, authController.getProfile);
router.patch('/me', protect, validate(updateProfileSchema), authController.updateProfile);
router.post('/change-password', protect, validate(changePasswordSchema), authController.changePassword);
router.post('/complete-onboarding', protect, authController.completeOnboarding);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), authController.googleOAuthCallback);
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false }), authController.githubOAuthCallback);

export default router;

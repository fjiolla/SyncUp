import { AuthService } from '../services/auth.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';
import { config } from '../config/index.js';

const cookieOptions = {
  httpOnly: true,
  secure: config.server.nodeEnv === 'production',
  sameSite: 'strict',
  maxAge: 10 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await AuthService.register(req.body);
  res.cookie('refreshToken', refreshToken, cookieOptions);
  return ResponseFormatter.success(res, { statusCode: 201, data: { accessToken, user } });
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await AuthService.login(req.body);
  res.cookie('refreshToken', refreshToken, cookieOptions);
  return ResponseFormatter.success(res, { statusCode: 200, data: { accessToken, user } });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  const result = await AuthService.refreshTokens(token);
  res.cookie('refreshToken', result.refreshToken, cookieOptions);
  return ResponseFormatter.success(res, { statusCode: 200, data: { accessToken: result.accessToken } });
});

export const logout = asyncHandler(async (req, res) => {
  await AuthService.logout(req.user._id);
  res.clearCookie('refreshToken', cookieOptions);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Logged out successfully' });
});

export const sendVerificationEmail = asyncHandler(async (req, res) => {
  await AuthService.sendVerificationEmail(req.user);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Verification email sent' });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  await AuthService.verifyEmail(req.params.token);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Email verified successfully' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await AuthService.forgotPassword(req.body.email);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'If an account with that email exists, a reset link has been sent' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await AuthService.resetPassword(req.body.token, req.body.password);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Password reset successfully' });
});

export const getProfile = asyncHandler(async (req, res) => {
  return ResponseFormatter.success(res, { statusCode: 200, data: req.user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await AuthService.updateProfile(req.user._id, req.body, req.files);
  return ResponseFormatter.success(res, { statusCode: 200, data: user });
});

export const changePassword = asyncHandler(async (req, res) => {
  await AuthService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Password changed successfully' });
});

export const googleOAuthCallback = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await AuthService.googleOAuth(req.user);
  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.redirect(`${config.cors.origin}/oauth/callback?token=${accessToken}`);
});

export const githubOAuthCallback = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await AuthService.githubOAuth(req.user);
  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.redirect(`${config.cors.origin}/oauth/callback?token=${accessToken}`);
});

export const completeOnboarding = asyncHandler(async (req, res) => {
  const user = await AuthService.completeOnboarding(req.user._id, req.body);
  return ResponseFormatter.success(res, { statusCode: 200, message: 'Onboarding complete', data: user });
});

import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import generateToken from '../utils/generateToken.js';
import User from '../models/User.js';
import { env } from '../config/env.js';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

const getOAuthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 5 * 60 * 1000,
  path: '/api/auth/oauth',
});

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${env.frontendUrl}/?oauth=failed` }), (req, res) => {
  const token = generateToken(req.user._id);
  res.cookie('oauth_temp_token', token, getOAuthCookieOptions());
  res.redirect(`${env.frontendUrl}/?oauth=success`);
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: `${env.frontendUrl}/?oauth=failed` }), (req, res) => {
  const token = generateToken(req.user._id);
  res.cookie('oauth_temp_token', token, getOAuthCookieOptions());
  res.redirect(`${env.frontendUrl}/?oauth=success`);
});

router.post('/oauth/exchange', async (req, res) => {
  try {
    const tempToken = req.cookies?.oauth_temp_token;
    res.clearCookie('oauth_temp_token', getOAuthCookieOptions());

    if (!tempToken) {
      return res.status(401).json({ message: 'OAuth token exchange failed' });
    }

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found for OAuth token' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      bio: user.bio,
      profilePicture: user.profilePicture,
      customEvents: user.customEvents,
      role: user.role,
      token: tempToken,
    });
  } catch (error) {
    return res.status(401).json({ message: 'OAuth token exchange failed' });
  }
});

export default router;

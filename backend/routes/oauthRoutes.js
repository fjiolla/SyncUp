import express from 'express';
import passport from 'passport';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/?authFailed=true' }), (req, res) => {
  const token = generateToken(req.user._id);
  res.redirect(`http://localhost:5173/?token=${token}`);
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: 'http://localhost:5173/?authFailed=true' }), (req, res) => {
  const token = generateToken(req.user._id);
  res.redirect(`http://localhost:5173/?token=${token}`);
});

export default router;

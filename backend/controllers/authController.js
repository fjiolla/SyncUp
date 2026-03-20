import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (!user.isVerified) {
      res.status(401);
      throw new Error('Please verify your email before logging in');
    }

    // Update lastActiveAt on successful login
    user.lastActiveAt = Date.now();
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      bio: user.bio,
      profilePicture: user.profilePicture,
      customEvents: user.customEvents,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, age } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const verificationToken = crypto.randomBytes(20).toString('hex');

  const user = await User.create({
    name,
    email,
    password,
    age: age || 18,
    verificationToken,
  });

  if (user) {
    // Mock Email Service
    console.log(`\n================================`);
    console.log(`[SMTP MOCK] Verification Email Sent!`);
    console.log(`To: ${user.email}`);
    console.log(`Link: http://localhost:5173/verify/${verificationToken}`);
    console.log(`================================\n`);

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      verificationRequired: true
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Verify Email Token
// @route   GET /api/auth/verify/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({ verificationToken: req.params.token });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully. You can now log in.' });
});

// @desc    Resend Verification Email
// @route   POST /api/auth/resend
// @access  Public
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('Email is already verified');
  }

  user.verificationToken = crypto.randomBytes(20).toString('hex');
  await user.save();

  // Mock Email Service
  console.log(`\n================================`);
  console.log(`[SMTP MOCK] Resent Verification Email!`);
  console.log(`To: ${user.email}`);
  console.log(`Link: http://localhost:5173/verify/${user.verificationToken}`);
  console.log(`================================\n`);

  res.json({ message: 'Verification email resent successfully.' });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
  // Since we are using Bearer tokens, the client handles true logout by deleting the token.
  // We can just return an OK response. If using cookies, we would clear the cookie here.
  res.status(200).json({ message: 'User logged out successfully' });
});

export { loginUser, registerUser, logoutUser, verifyEmail, resendVerification };

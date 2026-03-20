import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Pod from '../models/Pod.js';
import crypto from 'crypto';
import { env } from '../config/env.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      bio: user.bio,
      interests: user.interests,
      profilePicture: user.profilePicture,
      customEvents: user.customEvents,
      isVerified: user.isVerified,
      role: user.role,
      lastActiveAt: user.lastActiveAt,
      podsCreated: await Pod.countDocuments({ organizer: user._id }),
      podsJoined: await Pod.countDocuments({ members: user._id }),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    let emailChanged = false;

    if (req.body.email && req.body.email !== user.email) {
      const emailTaken = await User.findOne({ email: req.body.email });
      if (emailTaken) {
        res.status(400);
        throw new Error('Email is already in use');
      }
      user.email = req.body.email;
      user.isVerified = false;
      user.verificationToken = crypto.randomBytes(20).toString('hex');
      emailChanged = true;
    }
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.interests = req.body.interests || user.interests;
    if (req.body.profilePicture !== undefined) {
      const url = req.body.profilePicture;
      if (url && !url.startsWith('https://') && !url.startsWith('http://')) {
        res.status(400);
        throw new Error('profilePicture must be a valid http(s) URL');
      }
      user.profilePicture = url;
    }
    user.customEvents = req.body.customEvents || user.customEvents;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    if (emailChanged) {
      console.log(`\n================================`);
      console.log(`[SMTP MOCK] Email Change Verification`);
      console.log(`To: ${updatedUser.email}`);
      console.log(`Link: ${env.frontendUrl}/verify/${updatedUser.verificationToken}`);
      console.log(`================================\n`);
    }

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      age: updatedUser.age,
      bio: updatedUser.bio,
      interests: updatedUser.interests,
      profilePicture: updatedUser.profilePicture,
      customEvents: updatedUser.customEvents,
      isVerified: updatedUser.isVerified,
      role: updatedUser.role,
      lastActiveAt: updatedUser.lastActiveAt,
      podsCreated: await Pod.countDocuments({ organizer: updatedUser._id }),
      podsJoined: await Pod.countDocuments({ members: updatedUser._id }),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      age: user.age,
      bio: user.bio,
      interests: user.interests,
      profilePicture: user.profilePicture,
      customEvents: user.customEvents,
      isVerified: user.isVerified,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
      podsCreated: await Pod.countDocuments({ organizer: user._id }),
      podsJoined: await Pod.countDocuments({ members: user._id }),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export { getUserProfile, updateUserProfile, getUserById };

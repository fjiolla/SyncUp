import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Pod from '../models/Pod.js';

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
      lastActiveAt: user.lastActiveAt,
      podsCreated: await Pod.countDocuments({ hostId: user._id }),
      podsJoined: await Pod.countDocuments({ 'members.userId': user._id }),
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
    user.email = req.body.email || user.email;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.interests = req.body.interests || user.interests;
    user.profilePicture = req.body.profilePicture !== undefined ? req.body.profilePicture : user.profilePicture;
    user.customEvents = req.body.customEvents || user.customEvents;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

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
      lastActiveAt: updatedUser.lastActiveAt,
      podsCreated: await Pod.countDocuments({ hostId: updatedUser._id }),
      podsJoined: await Pod.countDocuments({ 'members.userId': updatedUser._id }),
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
      podsCreated: await Pod.countDocuments({ hostId: user._id }),
      podsJoined: await Pod.countDocuments({ 'members.userId': user._id }),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export { getUserProfile, updateUserProfile, getUserById };

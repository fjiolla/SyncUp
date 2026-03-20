import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Pod from '../models/Pod.js';
import Report from '../models/Report.js';

// @desc    Get all active users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Get all active pods
// @route   GET /api/admin/pods
// @access  Private/Admin
const getPods = asyncHandler(async (req, res) => {
  const pods = await Pod.find({});
  res.json(pods);
});

// @desc    Get all generated reports alongside reporter/target populated values
// @route   GET /api/admin/reports
// @access  Private/Admin
const getReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({})
    .populate('reporter', 'name email profilePicture')
    .sort({ createdAt: -1 });
  
  res.json(reports);
});

export { getUsers, getPods, getReports };

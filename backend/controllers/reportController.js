import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Report from '../models/Report.js';
import User from '../models/User.js';
import Pod from '../models/Pod.js';

const isValidObjectId = (value) => value && /^[a-fA-F0-9]{24}$/.test(String(value));

// @desc    Submit a new issue report
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason, details } = req.body;

  if (!targetType || !['user', 'pod'].includes(targetType)) {
    res.status(400);
    throw new Error('Invalid or missing targetType. Must be "user" or "pod".');
  }

  if (!targetId || !reason) {
    res.status(400);
    throw new Error('targetId and reason are required fields');
  }

  if (!isValidObjectId(targetId)) {
    res.status(400);
    throw new Error('Invalid targetId');
  }

  const exists = targetType === 'user'
    ? await User.exists({ _id: targetId })
    : await Pod.exists({ _id: targetId });
  if (!exists) {
    res.status(404);
    throw new Error('Target not found');
  }

  const report = await Report.create({
    reporter: req.user._id,
    targetType,
    targetId,
    reason,
    details: details || '',
  });

  if (report) {
    res.status(201).json({ message: 'Report submitted successfully', reportId: report._id });
  } else {
    res.status(400);
    throw new Error('Invalid report data');
  }
});

export { createReport };

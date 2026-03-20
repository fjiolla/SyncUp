import asyncHandler from 'express-async-handler';
import Report from '../models/Report.js';

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

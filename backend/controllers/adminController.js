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
    .sort({ createdAt: -1 })
    .lean();

  const withTargets = await Promise.all(
    reports.map(async (r) => {
      const target = r.targetType === 'pod'
        ? await Pod.findById(r.targetId).select('title').lean()
        : await User.findById(r.targetId).select('name').lean();
      return { ...r, target };
    })
  );

  res.json(withTargets);
});

// @desc    Resolve a report (set status to resolved)
// @route   PUT /api/admin/reports/:id
// @access  Private/Admin
const resolveReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status: 'resolved' },
    { new: true }
  );
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }
  res.json(report);
});

// @desc    Delete a pod (admin override)
// @route   DELETE /api/admin/pods/:id
// @access  Private/Admin
const deletePodAsAdmin = asyncHandler(async (req, res) => {
  const pod = await Pod.findById(req.params.id);
  if (!pod) {
    res.status(404);
    throw new Error('Pod not found');
  }
  await pod.deleteOne();

  const io = req.app.get('io');
  if (io) io.emit('pod_deleted', pod._id);

  res.json({ message: 'Pod removed by admin' });
});

export { getUsers, getPods, getReports, resolveReport, deletePodAsAdmin };

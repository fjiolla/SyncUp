import { asyncHandler } from '../middlewares/asyncHandler.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';
import { User } from '../models/user.model.js';
import { Pod } from '../models/pod.model.js';
import { Post } from '../models/post.model.js';
import { Event } from '../models/event.model.js';
import { Report } from '../models/report.model.js';
import { UserRepository } from '../repositories/user.repository.js';

export const getStats = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers, totalPods, totalPosts, totalEvents,
    newUsers7d, newUsers30d,
    activePods, pendingReports, suspendedUsers,
    topPods,
  ] = await Promise.all([
    User.countDocuments({ deletedAt: null }),
    Pod.countDocuments({ deletedAt: null }),
    Post.countDocuments({ deletedAt: null }),
    Event.countDocuments({ deletedAt: null }),
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo }, deletedAt: null }),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, deletedAt: null }),
    Pod.countDocuments({ deletedAt: null, status: 'active' }),
    Report.countDocuments({ status: 'pending' }),
    User.countDocuments({ accountStatus: 'suspended' }),
    Pod.find({ deletedAt: null, status: 'active' }).sort({ memberCount: -1 }).limit(5).select('name slug memberCount category').lean(),
  ]);

  const signupsByDay = await User.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo }, deletedAt: null } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  return ResponseFormatter.success(res, {
    statusCode: 200,
    data: {
      totals: { users: totalUsers, pods: totalPods, posts: totalPosts, events: totalEvents, activePods, pendingReports, suspendedUsers },
      growth: { newUsers7d, newUsers30d },
      signupsByDay,
      topPods,
    },
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status } = req.query;
  const filter = { deletedAt: null };
  if (status) filter.accountStatus = status;
  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ fullName: regex }, { username: regex }, { email: regex }];
  }

  const total = await User.countDocuments(filter);
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const results = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip).limit(parseInt(limit))
    .select('fullName username email profileImage role accountStatus createdAt isEmailVerified isPhoneVerified')
    .lean();

  return ResponseFormatter.paginated(res, {
    message: 'Users retrieved',
    data: results,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
      hasPrevPage: parseInt(page) > 1,
    },
  });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { accountStatus } = req.body;
  await UserRepository.update(req.params.userId, { accountStatus });
  return ResponseFormatter.success(res, { statusCode: 200, message: 'User status updated' });
});

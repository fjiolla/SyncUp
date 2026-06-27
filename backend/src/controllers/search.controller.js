import { asyncHandler } from '../middlewares/asyncHandler.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';
import { Pod } from '../models/pod.model.js';
import { Event } from '../models/event.model.js';
import { User } from '../models/user.model.js';

export const search = asyncHandler(async (req, res) => {
  const { q, type } = req.query;

  if (!q || q.trim().length < 2) {
    return ResponseFormatter.success(res, { statusCode: 200, data: { pods: [], events: [], users: [] } });
  }

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const limit = 8;

  const [pods, events, users] = await Promise.all([
    (!type || type === 'pods')
      ? Pod.find({ deletedAt: null, status: 'active', $or: [{ name: regex }, { description: regex }, { category: regex }, { tags: regex }] })
          .select('name slug description category memberCount visibility tags')
          .limit(limit)
          .lean()
      : [],

    (!type || type === 'events')
      ? Event.find({ deletedAt: null, status: { $ne: 'cancelled' }, $or: [{ title: regex }, { description: regex }, { location: regex }] })
          .select('title startDate endDate eventType location pod')
          .populate('pod', 'name slug')
          .limit(limit)
          .lean()
      : [],

    (!type || type === 'users')
      ? User.find({ deletedAt: null, accountStatus: 'active', $or: [{ fullName: regex }, { username: regex }] })
          .select('fullName username profileImage bio')
          .limit(limit)
          .lean()
      : [],
  ]);

  return ResponseFormatter.success(res, { statusCode: 200, data: { pods, events, users } });
});

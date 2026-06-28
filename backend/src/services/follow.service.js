import { FollowRepository } from '../repositories/follow.repository.js';
import { NotificationService } from './notification.service.js';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { ApiError } from '../exceptions/ApiError.js';
import { logger } from '../logger/index.js';

const notify = async (payload) => {
  try {
    await NotificationService.createNotification(payload);
  } catch (err) {
    logger.error({ err, type: payload?.type, recipient: payload?.recipient }, 'Failed to create notification');
  }
};

const clearFollowRequestNotification = async (recipientId, senderId) => {
  try {
    await NotificationRepository.deleteWhere({
      recipient: recipientId,
      sender: senderId,
      type: 'follow_request',
    });
  } catch (err) {
    logger.error({ err, recipient: recipientId, sender: senderId }, 'Failed to clear follow_request notification');
  }
};

export const FollowService = {
  async requestFollow(followerId, followingId) {
    if (followerId.toString() === followingId.toString()) {
      throw ApiError.badRequest('Cannot follow yourself');
    }

    const existing = await FollowRepository.findFollow(followerId, followingId);
    if (existing) {
      const status = existing.status || 'accepted';
      if (status === 'pending') {
        throw ApiError.conflict('Follow request already sent');
      }
      throw ApiError.conflict('Already following this user');
    }

    const follow = await FollowRepository.create({
      follower: followerId,
      following: followingId,
      status: 'pending',
    });

    const follower = await UserRepository.findById(followerId).catch(() => null);
    await notify({
      recipient: followingId,
      sender: followerId,
      type: 'follow_request',
      title: 'New follow request',
      body: follower ? `${follower.fullName} (@${follower.username}) wants to follow you` : 'Someone wants to follow you',
      referenceId: followerId,
      referenceType: 'User',
    });

    return follow;
  },

  async acceptRequest(recipientId, requesterId) {
    const follow = await FollowRepository.findFollow(requesterId, recipientId);
    if (!follow) throw ApiError.notFound('Follow request not found');

    // Always clear the stale follow_request notification, even if the follow
    // was already accepted, so it doesn't keep reappearing on the recipient's feed.
    await clearFollowRequestNotification(recipientId, requesterId);

    if (follow.status === 'accepted') return follow;

    await FollowRepository.model.updateOne(
      { _id: follow._id },
      { $set: { status: 'accepted', acceptedAt: new Date() } }
    );

    const accepter = await UserRepository.findById(recipientId).catch(() => null);
    await notify({
      recipient: requesterId,
      sender: recipientId,
      type: 'follow_accept',
      title: 'Follow request accepted',
      body: accepter ? `${accepter.fullName} accepted your follow request` : 'Your follow request was accepted',
      referenceId: recipientId,
      referenceType: 'User',
    });

    return { ...follow, status: 'accepted', acceptedAt: new Date() };
  },

  async declineRequest(recipientId, requesterId) {
    const follow = await FollowRepository.findFollow(requesterId, recipientId);
    if (!follow) throw ApiError.notFound('Follow request not found');
    await FollowRepository.model.deleteOne({ _id: follow._id });
    await clearFollowRequestNotification(recipientId, requesterId);
  },

  async unfollowUser(followerId, followingId) {
    const follow = await FollowRepository.findFollow(followerId, followingId);
    if (!follow) {
      throw ApiError.notFound('Not following this user');
    }

    await FollowRepository.model.deleteOne({ _id: follow._id });
  },

  async cancelRequest(followerId, followingId) {
    const follow = await FollowRepository.findFollow(followerId, followingId);
    if (!follow) throw ApiError.notFound('No follow request found');
    if (follow.status !== 'pending') throw ApiError.badRequest('Cannot cancel an accepted follow');
    await FollowRepository.model.deleteOne({ _id: follow._id });
  },

  async getFollowers(viewerId, profileUserId, { page = 1, limit = 20 } = {}) {
    await this.assertCanViewLists(viewerId, profileUserId);
    return FollowRepository.getFollowers(profileUserId, { page, limit, status: 'accepted' });
  },

  async getFollowing(viewerId, profileUserId, { page = 1, limit = 20 } = {}) {
    await this.assertCanViewLists(viewerId, profileUserId);
    return FollowRepository.getFollowing(profileUserId, { page, limit, status: 'accepted' });
  },

  async getPendingRequests(userId, { page = 1, limit = 20 } = {}) {
    return FollowRepository.getPendingRequests(userId, { page, limit });
  },

  async getMutuals(viewerId, profileUserId) {
    if (viewerId && viewerId.toString() === profileUserId.toString()) return [];
    return FollowRepository.getMutuals(viewerId, profileUserId);
  },

  async getRelationship(viewerId, profileUserId) {
    if (!viewerId) return { state: 'none', followsYou: false };
    if (viewerId.toString() === profileUserId.toString()) return { state: 'self', followsYou: false };

    const [outgoing, incoming] = await Promise.all([
      FollowRepository.findFollow(viewerId, profileUserId),
      FollowRepository.findFollow(profileUserId, viewerId),
    ]);

    const outStatus = outgoing ? (outgoing.status || 'accepted') : null;
    const inStatus = incoming ? (incoming.status || 'accepted') : null;

    let state = 'none';
    if (outStatus === 'accepted') state = 'following';
    else if (outStatus === 'pending') state = 'requested';

    const followsYou = inStatus === 'accepted';

    return { state, followsYou };
  },

  async assertCanViewLists(viewerId, profileUserId) {
    if (!viewerId) throw ApiError.forbidden('Sign in to view this list');
    if (viewerId.toString() === profileUserId.toString()) return;
    const follow = await FollowRepository.findFollow(viewerId, profileUserId);
    const status = follow ? (follow.status || 'accepted') : null;
    if (status !== 'accepted') {
      throw ApiError.forbidden('Follow this user to see their connections');
    }
  },
};

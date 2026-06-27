import { PodRepository } from '../repositories/pod.repository.js';
import { PodMemberRepository } from '../repositories/podMember.repository.js';
import { UploadService } from './upload.service.js';
import { NotificationService } from './notification.service.js';
import { UserRepository } from '../repositories/user.repository.js';
import { ApiError } from '../exceptions/ApiError.js';

const ROLE_HIERARCHY = { owner: 4, admin: 3, moderator: 2, member: 1 };

const notify = async (payload) => {
  try {
    await NotificationService.createNotification(payload);
  } catch {}
};

const uploadDataUrlToCloudinary = async (dataUrl, folder) => {
  const match = dataUrl.match(/^data:image\/[a-zA-Z+]+;base64,(.+)$/);
  if (!match) throw new Error('Invalid image data URL');
  const buffer = Buffer.from(match[1], 'base64');
  return UploadService.uploadImage(buffer, folder);
};

const getUserRole = async (podId, userId) => {
  const membership = await PodMemberRepository.findMembership(podId, userId);
  if (!membership || membership.status !== 'approved') return null;
  return membership.role;
};

const verifyRole = async (podId, userId, minRoles) => {
  const role = await getUserRole(podId, userId);
  if (!role || !minRoles.includes(role)) {
    throw ApiError.forbidden('You do not have permission to perform this action');
  }
  return role;
};

export const PodService = {
  async getPodBySlug(slug, viewerId = null) {
    const pod = await PodRepository.findBySlug(slug);
    if (!pod) throw ApiError.notFound('Pod not found');

    let myStatus = null;
    let myRole = null;
    if (viewerId) {
      const membership = await PodMemberRepository.findMembership(pod._id, viewerId);
      if (membership) {
        myStatus = membership.status;
        myRole = membership.role;
      }
    }

    return {
      ...pod,
      myStatus,
      myRole,
      isOwner: viewerId ? (pod.owner?._id || pod.owner)?.toString() === viewerId.toString() : false,
    };
  },

  async createPod(userId, data) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existingPod = await PodRepository.findBySlug(slug);
    if (existingPod) {
      throw ApiError.conflict('A pod with this name already exists');
    }

    if (data.banner && typeof data.banner === 'string' && data.banner.startsWith('data:image/')) {
      try {
        const result = await uploadDataUrlToCloudinary(data.banner, 'pod-banners');
        data.banner = result.secureUrl;
      } catch {
        data.banner = '';
      }
    }

    const pod = await PodRepository.create({ ...data, owner: userId, slug });

    await PodMemberRepository.create({
      pod: pod._id,
      user: userId,
      role: 'owner',
      status: 'approved',
    });

    return pod;
  },

  async updatePod(podId, userId, data) {
    await verifyRole(podId, userId, ['owner', 'admin']);

    if (data.banner && typeof data.banner === 'string' && data.banner.startsWith('data:image/')) {
      try {
        const result = await uploadDataUrlToCloudinary(data.banner, 'pod-banners');
        data.banner = result.secureUrl;
      } catch {
        delete data.banner;
      }
    }

    if (data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existingPod = await PodRepository.findBySlug(data.slug);
      if (existingPod && existingPod._id.toString() !== podId) {
        throw ApiError.conflict('A pod with this name already exists');
      }
    }

    return PodRepository.update(podId, data);
  },

  async deletePod(podId, userId) {
    await verifyRole(podId, userId, ['owner']);
    return PodRepository.delete(podId);
  },

  async discoverPods({ page = 1, limit = 10, category, search, sort = '-createdAt' } = {}) {
    if (search) {
      return PodRepository.searchPods(search, { page, limit, sort });
    }

    const filter = { status: { $in: ['active'] }, visibility: 'public' };
    if (category) filter.category = category;

    return PodRepository.paginate({ page, limit, filter, sort });
  },

  async getUserPods(userId, { page = 1, limit = 10 } = {}) {
    return PodMemberRepository.findUserPods(userId, { page, limit });
  },

  async joinPod(podId, userId) {
    const pod = await PodRepository.findById(podId);
    if (pod.status !== 'active') throw ApiError.badRequest('This pod is not active');
    if (pod.memberCount >= pod.maxMembers) throw ApiError.badRequest('This pod is full');

    const status = (pod.visibility === 'private' || pod.requiresApproval) ? 'pending' : 'approved';

    const existingMembership = await PodMemberRepository.findMembership(podId, userId);
    if (existingMembership) {
      if (existingMembership.status === 'approved') {
        throw ApiError.conflict('You are already a member of this pod');
      }
      if (existingMembership.status === 'pending') {
        throw ApiError.conflict('You already have a pending request');
      }
      if (existingMembership.status === 'left' || existingMembership.status === 'removed' || existingMembership.status === 'rejected') {
        await PodMemberRepository.updateStatus(podId, userId, status);
        if (status === 'approved') await PodRepository.incrementMemberCount(podId);
        await this._notifyJoin(pod, userId, status);
        return { status };
      }
    }

    await PodMemberRepository.create({
      pod: podId,
      user: userId,
      role: 'member',
      status,
    });

    if (status === 'approved') await PodRepository.incrementMemberCount(podId);

    await this._notifyJoin(pod, userId, status);

    return { status };
  },

  async _notifyJoin(pod, userId, status) {
    const ownerId = pod.owner?._id || pod.owner;
    if (!ownerId) return;
    const joiner = await UserRepository.findById(userId).catch(() => null);
    if (status === 'pending') {
      await notify({
        recipient: ownerId,
        sender: userId,
        type: 'join_request',
        title: 'New join request',
        body: joiner ? `${joiner.fullName} requested to join "${pod.name}"` : `Someone requested to join "${pod.name}"`,
        referenceId: pod._id,
        referenceType: 'Pod',
        referenceSlug: pod.slug,
      });
    } else {
      await notify({
        recipient: ownerId,
        sender: userId,
        type: 'join_approved',
        title: 'New attendee',
        body: joiner ? `${joiner.fullName} is now attending "${pod.name}"` : `Someone joined "${pod.name}"`,
        referenceId: pod._id,
        referenceType: 'Pod',
        referenceSlug: pod.slug,
      });
    }
  },

  async leavePod(podId, userId) {
    const membership = await PodMemberRepository.findMembership(podId, userId);
    if (!membership || membership.status !== 'approved') {
      throw ApiError.badRequest('You are not a member of this pod');
    }
    if (membership.role === 'owner') {
      throw ApiError.badRequest('Owner cannot leave the pod. Transfer ownership or delete the pod.');
    }

    await PodMemberRepository.updateStatus(podId, userId, 'left');
    await PodRepository.decrementMemberCount(podId);
  },

  async requestToJoin(podId, userId) {
    const pod = await PodRepository.findById(podId);
    if (pod.status !== 'active') throw ApiError.badRequest('This pod is not active');

    const existingMembership = await PodMemberRepository.findMembership(podId, userId);
    if (existingMembership && existingMembership.status === 'approved') {
      throw ApiError.conflict('You are already a member of this pod');
    }
    if (existingMembership && existingMembership.status === 'pending') {
      throw ApiError.conflict('You already have a pending request');
    }

    if (existingMembership) {
      await PodMemberRepository.updateStatus(podId, userId, 'pending');
    } else {
      await PodMemberRepository.create({
        pod: podId,
        user: userId,
        role: 'member',
        status: 'pending',
      });
    }

    return { status: 'pending' };
  },

  async approveJoinRequest(podId, userId, requesterId) {
    await verifyRole(podId, userId, ['owner', 'admin', 'moderator']);

    const membership = await PodMemberRepository.findMembership(podId, requesterId);
    if (!membership || membership.status !== 'pending') {
      throw ApiError.badRequest('No pending request found for this user');
    }

    await PodMemberRepository.updateStatus(podId, requesterId, 'approved');
    await PodRepository.incrementMemberCount(podId);

    const pod = await PodRepository.findById(podId).catch(() => null);
    await notify({
      recipient: requesterId,
      sender: userId,
      type: 'join_approved',
      title: 'Request approved',
      body: pod ? `You're in! Your request to join "${pod.name}" was approved` : 'Your join request was approved',
      referenceId: podId,
      referenceType: 'Pod',
      referenceSlug: pod?.slug,
    });
  },

  async rejectJoinRequest(podId, userId, requesterId) {
    await verifyRole(podId, userId, ['owner', 'admin', 'moderator']);

    const membership = await PodMemberRepository.findMembership(podId, requesterId);
    if (!membership || membership.status !== 'pending') {
      throw ApiError.badRequest('No pending request found for this user');
    }

    await PodMemberRepository.updateStatus(podId, requesterId, 'rejected');

    const pod = await PodRepository.findById(podId).catch(() => null);
    await notify({
      recipient: requesterId,
      sender: userId,
      type: 'join_rejected',
      title: 'Request declined',
      body: pod ? `Your request to join "${pod.name}" was declined` : 'Your join request was declined',
      referenceId: podId,
      referenceType: 'Pod',
      referenceSlug: pod?.slug,
    });
  },

  async removeMember(podId, userId, targetUserId) {
    const actorRole = await verifyRole(podId, userId, ['owner', 'admin', 'moderator']);
    const targetMembership = await PodMemberRepository.findMembership(podId, targetUserId);

    if (!targetMembership || targetMembership.status !== 'approved') {
      throw ApiError.badRequest('User is not a member of this pod');
    }

    if (ROLE_HIERARCHY[actorRole] <= ROLE_HIERARCHY[targetMembership.role]) {
      throw ApiError.forbidden('You cannot remove a member with equal or higher role');
    }

    await PodMemberRepository.updateStatus(podId, targetUserId, 'removed');
    await PodRepository.decrementMemberCount(podId);
  },

  async promoteMember(podId, userId, targetUserId, newRole) {
    const actorRole = await verifyRole(podId, userId, ['owner', 'admin']);

    const targetMembership = await PodMemberRepository.findMembership(podId, targetUserId);
    if (!targetMembership || targetMembership.status !== 'approved') {
      throw ApiError.badRequest('User is not a member of this pod');
    }

    if (actorRole === 'admin' && newRole === 'admin') {
      throw ApiError.forbidden('Only the owner can promote to admin');
    }

    if (ROLE_HIERARCHY[actorRole] <= ROLE_HIERARCHY[newRole]) {
      throw ApiError.forbidden('You cannot promote to a role equal or higher than yours');
    }

    await PodMemberRepository.updateRole(podId, targetUserId, newRole);
  },

  async inviteMember(podId, userId, targetUserId) {
    await verifyRole(podId, userId, ['owner', 'admin', 'moderator']);

    const pod = await PodRepository.findById(podId);
    if (pod.memberCount >= pod.maxMembers) throw ApiError.badRequest('This pod is full');

    const existingMembership = await PodMemberRepository.findMembership(podId, targetUserId);
    if (existingMembership && existingMembership.status === 'approved') {
      throw ApiError.conflict('User is already a member of this pod');
    }

    if (existingMembership) {
      await PodMemberRepository.updateStatus(podId, targetUserId, 'pending');
      return;
    }

    await PodMemberRepository.create({
      pod: podId,
      user: targetUserId,
      role: 'member',
      status: 'pending',
      invitedBy: userId,
    });
  },

  async getPodMembers(podId, { page = 1, limit = 20, role } = {}) {
    return PodMemberRepository.findPodMembers(podId, { page, limit, role });
  },
};

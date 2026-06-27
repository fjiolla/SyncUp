import { asyncHandler } from '../middlewares/asyncHandler.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';
import { ApiError } from '../exceptions/ApiError.js';
import { UserRepository } from '../repositories/user.repository.js';
import { FollowRepository } from '../repositories/follow.repository.js';
import { FollowService } from '../services/follow.service.js';
import { PodMemberRepository } from '../repositories/podMember.repository.js';
import { Post } from '../models/post.model.js';

export const getUserByUsername = asyncHandler(async (req, res) => {
  const user = await UserRepository.findByUsername(req.params.username);
  if (!user) throw ApiError.notFound('User not found');

  const viewerId = req.user?._id || null;

  const [followerCount, followingCount, postCount, podCount, relationship, mutuals] = await Promise.all([
    FollowRepository.getFollowerCount(user._id),
    FollowRepository.getFollowingCount(user._id),
    Post.countDocuments({ author: user._id, deletedAt: null }),
    PodMemberRepository.model.countDocuments({ user: user._id, status: 'approved' }),
    FollowService.getRelationship(viewerId, user._id),
    viewerId ? FollowService.getMutuals(viewerId, user._id) : Promise.resolve([]),
  ]);

  const isSelf = viewerId ? viewerId.toString() === user._id.toString() : false;
  const canViewLists = isSelf || relationship.state === 'following';

  const publicProfile = {
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    bio: user.bio,
    profileImage: user.profileImage,
    coverImage: user.coverImage,
    location: user.location,
    profession: user.profession,
    college: user.college,
    website: user.website,
    socialLinks: user.socialLinks,
    interests: user.interests,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    createdAt: user.createdAt,
    followerCount,
    followingCount,
    postCount,
    podCount,
    followState: relationship.state,
    followsYou: relationship.followsYou,
    canViewLists,
    mutuals,
    mutualCount: mutuals.length,
    isFollowing: relationship.state === 'following',
    isSelf,
  };

  return ResponseFormatter.success(res, { statusCode: 200, data: publicProfile });
});

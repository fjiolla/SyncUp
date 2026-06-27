import { PostRepository } from '../repositories/post.repository.js';
import { CommentRepository } from '../repositories/comment.repository.js';
import { PodMemberRepository } from '../repositories/podMember.repository.js';
import { Like } from '../models/like.model.js';
import { SavedPost } from '../models/savedPost.model.js';
import { ApiError } from '../exceptions/ApiError.js';

export const PostService = {
  async createPost(userId, podId, data) {
    const membership = await PodMemberRepository.findMembership(podId, userId);
    if (!membership || membership.status !== 'approved') {
      throw ApiError.forbidden('You must be a member of this pod to create a post');
    }

    const post = await PostRepository.create({
      pod: podId,
      author: userId,
      content: data.content,
      images: data.images || [],
      visibility: data.visibility || 'pod_only',
    });

    return post;
  },

  async getPost(postId) {
    return PostRepository.findById(postId, {
      populate: { path: 'author', select: 'fullName username profileImage' },
    });
  },

  async getPodPosts(podId, { page, limit, sort } = {}) {
    return PostRepository.findByPod(podId, { page, limit, sort });
  },

  async updatePost(postId, userId, data) {
    const post = await PostRepository.findById(postId);
    if (post.author.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only edit your own posts');
    }

    const updateData = { edited: true };
    if (data.content) updateData.content = data.content;
    if (data.images) updateData.images = data.images;

    return PostRepository.update(postId, updateData);
  },

  async deletePost(postId, userId) {
    const post = await PostRepository.findById(postId);
    const isAuthor = post.author.toString() === userId.toString();

    if (!isAuthor) {
      const membership = await PodMemberRepository.findMembership(post.pod, userId);
      if (!membership || !['owner', 'admin', 'moderator'].includes(membership.role)) {
        throw ApiError.forbidden('You do not have permission to delete this post');
      }
    }

    return PostRepository.delete(postId);
  },

  async likePost(postId, userId) {
    await PostRepository.findById(postId);
    try {
      await Like.create({ post: postId, user: userId });
    } catch (err) {
      if (err.code === 11000) {
        throw ApiError.conflict('You have already liked this post');
      }
      throw err;
    }
    await PostRepository.incrementLikeCount(postId);
  },

  async unlikePost(postId, userId) {
    const like = await Like.findOneAndDelete({ post: postId, user: userId });
    if (!like) {
      throw ApiError.notFound('Like not found');
    }
    await PostRepository.decrementLikeCount(postId);
  },

  async savePost(postId, userId) {
    await PostRepository.findById(postId);
    try {
      await SavedPost.create({ user: userId, post: postId });
    } catch (err) {
      if (err.code === 11000) {
        throw ApiError.conflict('You have already saved this post');
      }
      throw err;
    }
    await PostRepository.incrementSaveCount(postId);
  },

  async unsavePost(postId, userId) {
    const saved = await SavedPost.findOneAndDelete({ user: userId, post: postId });
    if (!saved) {
      throw ApiError.notFound('Saved post not found');
    }
    await PostRepository.decrementSaveCount(postId);
  },

  async getSavedPosts(userId, { page = 1, limit = 10 } = {}) {
    const total = await SavedPost.countDocuments({ user: userId });
    const skip = (page - 1) * limit;

    const results = await SavedPost.find({ user: userId })
      .skip(skip)
      .limit(limit)
      .sort('-savedAt')
      .populate({
        path: 'post',
        populate: { path: 'author', select: 'fullName username profileImage' },
      })
      .lean();

    return {
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  },

  async addComment(postId, userId, data) {
    await PostRepository.findById(postId);

    const commentData = {
      post: postId,
      user: userId,
      content: data.content,
    };

    if (data.parentComment) {
      commentData.parentComment = data.parentComment;
    }

    const comment = await CommentRepository.create(commentData);
    await PostRepository.incrementCommentCount(postId);
    return comment;
  },

  async getComments(postId, { page, limit } = {}) {
    return CommentRepository.findByPost(postId, { page, limit });
  },

  async getReplies(commentId, { page, limit } = {}) {
    return CommentRepository.findReplies(commentId, { page, limit });
  },

  async deleteComment(commentId, userId) {
    const comment = await CommentRepository.findById(commentId);
    if (comment.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only delete your own comments');
    }

    await CommentRepository.update(commentId, { deletedAt: new Date() });
    await PostRepository.decrementCommentCount(comment.post);
  },
};

import { BaseRepository } from './base.repository.js';
import { Post } from '../models/post.model.js';

class PostRepositoryClass extends BaseRepository {
  constructor() {
    super(Post);
  }

  async findByPod(podId, { page = 1, limit = 10, sort = '-createdAt' } = {}) {
    return this.paginate({
      page,
      limit,
      filter: { pod: podId, status: 'active' },
      sort,
      populate: { path: 'author', select: 'fullName username profileImage' },
    });
  }

  async findByAuthor(authorId, { page = 1, limit = 10 } = {}) {
    return this.paginate({
      page,
      limit,
      filter: { author: authorId, status: 'active' },
      sort: '-createdAt',
      populate: { path: 'author', select: 'fullName username profileImage' },
    });
  }

  async incrementLikeCount(postId) {
    return this.model.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } }, { new: true });
  }

  async decrementLikeCount(postId) {
    return this.model.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } }, { new: true });
  }

  async incrementCommentCount(postId) {
    return this.model.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } }, { new: true });
  }

  async decrementCommentCount(postId) {
    return this.model.findByIdAndUpdate(postId, { $inc: { commentCount: -1 } }, { new: true });
  }

  async incrementSaveCount(postId) {
    return this.model.findByIdAndUpdate(postId, { $inc: { saveCount: 1 } }, { new: true });
  }

  async decrementSaveCount(postId) {
    return this.model.findByIdAndUpdate(postId, { $inc: { saveCount: -1 } }, { new: true });
  }
}

export const PostRepository = new PostRepositoryClass();

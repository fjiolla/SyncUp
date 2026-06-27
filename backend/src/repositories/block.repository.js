import { BaseRepository } from './base.repository.js';
import { Block } from '../models/block.model.js';

class BlockRepositoryClass extends BaseRepository {
  constructor() { super(Block); }

  async findBlock(blockerId, blockedId) {
    return this.model.findOne({ blocker: blockerId, blocked: blockedId }).lean();
  }

  async listBlocked(userId) {
    return this.model.find({ blocker: userId })
      .populate('blocked', 'fullName username profileImage')
      .lean();
  }

  async unblock(blockerId, blockedId) {
    return this.model.findOneAndDelete({ blocker: blockerId, blocked: blockedId });
  }
}

export const BlockRepository = new BlockRepositoryClass();

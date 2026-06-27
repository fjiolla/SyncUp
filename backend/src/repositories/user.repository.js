import { BaseRepository } from './base.repository.js';
import { User } from '../models/user.model.js';

class UserRepositoryClass extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model.findOne({ email, deletedAt: null });
  }

  async findByEmailWithPassword(email) {
    return this.model.findOne({ email, deletedAt: null }).select('+password +refreshToken');
  }

  async findByUsername(username) {
    return this.model.findOne({ username, deletedAt: null });
  }

  async findByProvider(provider, providerId) {
    return this.model.findOne({ provider, providerId, deletedAt: null });
  }

  async updateRefreshToken(userId, refreshToken) {
    return this.model.findByIdAndUpdate(userId, { refreshToken }, { new: true });
  }

  async updatePassword(userId, hashedPassword) {
    return this.model.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
  }

  async verifyEmail(userId) {
    return this.model.findByIdAndUpdate(userId, { isEmailVerified: true }, { new: true });
  }

  async verifyPhone(userId) {
    return this.model.findByIdAndUpdate(userId, { isPhoneVerified: true }, { new: true });
  }
}

export const UserRepository = new UserRepositoryClass();

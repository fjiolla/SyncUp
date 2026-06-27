import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository.js';
import { TokenService } from './token.service.js';
import { EmailService } from './email.service.js';
import { UploadService } from './upload.service.js';
import { ApiError } from '../exceptions/ApiError.js';
import { config } from '../config/index.js';

const uploadDataUrl = async (dataUrl, folder) => {
  const match = dataUrl.match(/^data:image\/[a-zA-Z+]+;base64,(.+)$/);
  if (!match) throw ApiError.badRequest('Invalid image data');
  const buffer = Buffer.from(match[1], 'base64');
  return UploadService.uploadImage(buffer, folder);
};

export const AuthService = {
  async register({ fullName, username, email, password }) {
    const existingEmail = await UserRepository.findByEmail(email);
    if (existingEmail) {
      throw ApiError.conflict('Email already in use');
    }

    const existingUsername = await UserRepository.findByUsername(username);
    if (existingUsername) {
      throw ApiError.conflict('Username already taken');
    }

    const user = await UserRepository.create({ fullName, username, email, password });
    const { accessToken, refreshToken } = TokenService.generateTokenPair(user);
    await UserRepository.updateRefreshToken(user._id, refreshToken);
    await this.sendVerificationEmail(user);

    return { user, accessToken, refreshToken };
  },

  async login({ email, password }) {
    const user = await UserRepository.findByEmailWithPassword(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.accountStatus !== 'active') {
      throw ApiError.forbidden('Account is not active');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const { accessToken, refreshToken } = TokenService.generateTokenPair(user);
    await UserRepository.updateRefreshToken(user._id, refreshToken);

    return { user, accessToken, refreshToken };
  },

  async refreshTokens(refreshToken) {
    const decoded = TokenService.verifyRefreshToken(refreshToken);
    const user = await UserRepository.findById(decoded.id, { select: '+refreshToken', lean: false });

    if (!user || user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const tokens = TokenService.generateTokenPair(user);
    await UserRepository.updateRefreshToken(user._id, tokens.refreshToken);

    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  },

  async logout(userId) {
    await UserRepository.updateRefreshToken(userId, null);
  },

  async sendVerificationEmail(user) {
    const token = jwt.sign(
      { id: user._id, purpose: 'email-verification' },
      config.jwt.accessSecret,
      { expiresIn: '24h' }
    );

    const verificationLink = `${config.cors.origin}/verify-email/${token}`;
    await EmailService.send({
      to: user.email,
      subject: 'Verify your email',
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
    });
  },

  async verifyEmail(token) {
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.accessSecret);
    } catch {
      throw ApiError.badRequest('Invalid or expired verification token');
    }

    if (decoded.purpose !== 'email-verification') {
      throw ApiError.badRequest('Invalid token purpose');
    }

    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await UserRepository.verifyEmail(decoded.id);
  },

  async forgotPassword(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return;
    }

    const token = jwt.sign(
      { id: user._id, purpose: 'password-reset' },
      config.jwt.accessSecret,
      { expiresIn: '1h' }
    );

    const resetLink = `${config.cors.origin}/reset-password/${token}`;
    await EmailService.send({
      to: user.email,
      subject: 'Reset your password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });
  },

  async resetPassword(token, newPassword) {
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.accessSecret);
    } catch {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    if (decoded.purpose !== 'password-reset') {
      throw ApiError.badRequest('Invalid token purpose');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await UserRepository.updatePassword(decoded.id, hashedPassword);
    await UserRepository.updateRefreshToken(decoded.id, null);
  },

  async getProfile(userId) {
    return UserRepository.findById(userId);
  },

  async updateProfile(userId, data, files) {
    if (data.username) {
      const existing = await UserRepository.findByUsername(data.username);
      if (existing && existing._id.toString() !== userId.toString()) {
        throw ApiError.conflict('Username already taken');
      }
      if (existing && existing._id.toString() === userId.toString()) {
        delete data.username;
      } else {
        data.needsOnboarding = false;
      }
    }

    if (data.profileImage && typeof data.profileImage === 'string' && data.profileImage.startsWith('data:image/')) {
      const result = await uploadDataUrl(data.profileImage, 'profiles');
      data.profileImage = result.secureUrl;
    }

    if (data.coverImage && typeof data.coverImage === 'string' && data.coverImage.startsWith('data:image/')) {
      const result = await uploadDataUrl(data.coverImage, 'covers');
      data.coverImage = result.secureUrl;
    }

    if (files && files.profileImage) {
      const result = await UploadService.uploadImage(files.profileImage.buffer || files.profileImage, 'profiles');
      data.profileImage = result.secureUrl;
    }

    if (files && files.coverImage) {
      const result = await UploadService.uploadImage(files.coverImage.buffer || files.coverImage, 'covers');
      data.coverImage = result.secureUrl;
    }

    return UserRepository.update(userId, data);
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await UserRepository.findById(userId, { select: '+password', lean: false });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await UserRepository.updatePassword(userId, hashedPassword);
    await UserRepository.updateRefreshToken(userId, null);
  },

  async googleOAuth(profile) {
    let user = await UserRepository.findByProvider('google', profile.id);

    if (!user) {
      user = await UserRepository.create({
        provider: 'google',
        providerId: profile.id,
        fullName: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
        email: profile.emails?.[0]?.value || profile.email,
        username: `temp_${profile.id}`,
        isEmailVerified: true,
        needsOnboarding: true,
      });
    }

    const { accessToken, refreshToken } = TokenService.generateTokenPair(user);
    await UserRepository.updateRefreshToken(user._id, refreshToken);

    return { user, accessToken, refreshToken };
  },

  async githubOAuth(profile) {
    let user = await UserRepository.findByProvider('github', profile.id);

    if (!user) {
      user = await UserRepository.create({
        provider: 'github',
        providerId: profile.id,
        fullName: profile.displayName || profile.username || `github_${profile.id}`,
        email: profile.emails?.[0]?.value || profile.email,
        username: `temp_${profile.id}`,
        isEmailVerified: true,
        needsOnboarding: true,
      });
    }

    const { accessToken, refreshToken } = TokenService.generateTokenPair(user);
    await UserRepository.updateRefreshToken(user._id, refreshToken);

    return { user, accessToken, refreshToken };
  },

  async completeOnboarding(userId, { username, interests, bio }) {
    const existing = await UserRepository.findByUsername(username);
    if (existing && existing._id.toString() !== userId.toString()) {
      throw ApiError.conflict('Username already taken');
    }

    const update = { username, needsOnboarding: false };
    if (interests) update.interests = interests;
    if (bio !== undefined) update.bio = bio;

    return UserRepository.update(userId, update);
  },
};

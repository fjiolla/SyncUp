import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: null },
  password: { type: String, select: false },
  bio: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  location: { type: String, default: '' },
  interests: [{ type: String }],
  profession: { type: String, default: '' },
  college: { type: String, default: '' },
  website: { type: String, default: '' },
  socialLinks: {
    twitter: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
  },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  needsOnboarding: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  accountStatus: { type: String, enum: ['active', 'suspended', 'deactivated'], default: 'active' },
  lastActive: { type: Date, default: Date.now },
  refreshToken: { type: String, select: false },
  provider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
  providerId: { type: String, default: null },
  notificationSettings: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
  },
  privacySettings: {
    profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
  },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

userSchema.index({ phone: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);

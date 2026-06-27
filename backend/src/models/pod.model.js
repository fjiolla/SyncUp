import mongoose from 'mongoose';

const podSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  customCategory: { type: String, default: '' },
  tags: [{ type: String }],
  icon: { type: String, default: '' },
  banner: { type: String, default: '' },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  eventType: { type: String, enum: ['virtual', 'in-person', 'hybrid'], default: 'in-person' },
  location: { type: String, default: '' },
  coordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    displayName: { type: String, default: '' },
  },
  meetingUrl: { type: String, default: '' },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memberCount: { type: Number, default: 1 },
  maxMembers: { type: Number, default: 1000 },
  rules: [{ type: String }],
  requiresApproval: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'archived', 'suspended', 'completed', 'cancelled'], default: 'active' },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

podSchema.index({ category: 1 });
podSchema.index({ tags: 1 });
podSchema.index({ owner: 1 });
podSchema.index({ startDate: 1 });
podSchema.index({ name: 'text', description: 'text', tags: 'text' });

podSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

export const Pod = mongoose.model('Pod', podSchema);

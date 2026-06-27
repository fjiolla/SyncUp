import mongoose from 'mongoose';

const podMemberSchema = new mongoose.Schema({
  pod: { type: mongoose.Schema.Types.ObjectId, ref: 'Pod', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'moderator', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'left', 'removed'], default: 'approved' },
  nickname: { type: String, default: '' },
});

podMemberSchema.index({ pod: 1, user: 1 }, { unique: true });
podMemberSchema.index({ pod: 1 });
podMemberSchema.index({ user: 1 });

export const PodMember = mongoose.model('PodMember', podMemberSchema);

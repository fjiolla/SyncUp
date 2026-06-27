import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['user', 'pod', 'post', 'comment', 'event'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: { type: String, enum: ['spam', 'harassment', 'inappropriate', 'misinformation', 'impersonation', 'other'], required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'reviewing', 'resolved', 'dismissed'], default: 'pending' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolution: { type: String, default: '' },
}, { timestamps: true });

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reporter: 1, targetType: 1, targetId: 1 });

export const Report = mongoose.model('Report', reportSchema);

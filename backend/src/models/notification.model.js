import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: [
      'follow_request', 'follow_accept', 'new_follower',
      'join_request', 'join_approved', 'join_rejected',
      'pod_invite', 'event_invite', 'event_update', 'event_reminder', 'event_cancelled',
      'role_change', 'new_message',
      'comment', 'like', 'reply', 'mention',
    ],
    required: true,
  },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  referenceType: { type: String, enum: ['Pod', 'Post', 'Event', 'Comment', 'User'] },
  referenceSlug: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ recipient: 1 });
notificationSchema.index({ isRead: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);

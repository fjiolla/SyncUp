import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  remindAt: { type: Date, required: true },
  sent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

reminderSchema.index({ user: 1, event: 1 }, { unique: true });
reminderSchema.index({ remindAt: 1, sent: 1 });

export const Reminder = mongoose.model('Reminder', reminderSchema);

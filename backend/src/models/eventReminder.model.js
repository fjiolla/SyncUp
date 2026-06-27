import mongoose from 'mongoose';

const eventReminderSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reminderDate: { type: Date, required: true },
  notified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

eventReminderSchema.index({ event: 1, user: 1 }, { unique: true });
eventReminderSchema.index({ reminderDate: 1, notified: 1 });

export const EventReminder = mongoose.model('EventReminder', eventReminderSchema);

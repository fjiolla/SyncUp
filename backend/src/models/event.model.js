import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  pod: { type: mongoose.Schema.Types.ObjectId, ref: 'Pod', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  banner: { type: String, default: '' },
  location: { type: String, default: '' },
  coordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    displayName: { type: String, default: '' },
  },
  eventType: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'online' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  maxParticipants: { type: Number, default: 100 },
  attendeeCount: { type: Number, default: 0 },
  registrationDeadline: { type: Date },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

eventSchema.index({ pod: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ organizer: 1 });

export const Event = mongoose.model('Event', eventSchema);

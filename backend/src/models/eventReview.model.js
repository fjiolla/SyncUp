import mongoose from 'mongoose';

const eventReviewSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  pod: { type: mongoose.Schema.Types.ObjectId, ref: 'Pod', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 1000, default: '' },
}, { timestamps: true });

eventReviewSchema.index({ event: 1, reviewer: 1 }, { unique: true });
eventReviewSchema.index({ pod: 1, createdAt: -1 });

export const EventReview = mongoose.model('EventReview', eventReviewSchema);

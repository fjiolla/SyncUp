import mongoose from 'mongoose';

const podSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'Other',
    },
    tags: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      required: true,
    },
    mapLink: {
      type: String,
      default: '',
    },
    minAge: {
      type: Number,
      required: true,
      default: 18,
    },
    maxAge: {
      type: Number,
      default: 100,
    },
    minTrustScore: {
      type: Number,
      default: 0,
    },
    requireVerified: {
      type: Boolean,
      default: false,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    maxMembers: {
      type: Number,
      required: true,
      default: 10,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual for spots left
podSchema.virtual('spotsLeft').get(function () {
  return this.maxMembers - this.members.length;
});

// Virtual for joined count
podSchema.virtual('joinedCount').get(function () {
  return this.members.length;
});

// Ensure virtuals are included in JSON output
podSchema.set('toJSON', { virtuals: true });
podSchema.set('toObject', { virtuals: true });

const Pod = mongoose.model('Pod', podSchema);

export default Pod;

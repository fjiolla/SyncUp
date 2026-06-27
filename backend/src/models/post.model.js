import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    pod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pod',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    visibility: {
      type: String,
      enum: ['public', 'pod_only'],
      default: 'pod_only',
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    saveCount: {
      type: Number,
      default: 0,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'hidden', 'removed'],
      default: 'active',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

postSchema.index({ pod: 1 });
postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });

export const Post = mongoose.model('Post', postSchema);

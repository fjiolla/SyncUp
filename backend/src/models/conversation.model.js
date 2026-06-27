import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    type: { type: String, enum: ['direct', 'group'], default: 'direct' },
    pod: { type: mongoose.Schema.Types.ObjectId, ref: 'Pod', default: null },
    initiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['pending', 'accepted'], default: 'accepted' },
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ status: 1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);

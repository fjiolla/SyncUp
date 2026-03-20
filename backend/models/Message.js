import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // populated for isolated 1-on-1 Private DMs
  podId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pod' }, // populated for Pod Group broadcasts
  content: { type: String, required: true, maxlength: 5000 },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ podId: 1 });
messageSchema.index({ createdAt: 1 });

export default mongoose.model('Message', messageSchema);

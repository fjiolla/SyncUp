import mongoose from 'mongoose';

const messageRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: {
    type: [mongoose.Schema.Types.ObjectId],
    validate: { validator: (v) => !v || (Array.isArray(v) && v.length === 2) },
  },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

messageRequestSchema.pre('save', function (next) {
  if (!this.participants?.length && this.requester && this.recipient) {
    const [a, b] = [this.requester.toString(), this.recipient.toString()].sort();
    this.participants = [new mongoose.Types.ObjectId(a), new mongoose.Types.ObjectId(b)];
  }
  next();
});

// Directional uniqueness (requester, recipient)
messageRequestSchema.index({ requester: 1, recipient: 1 }, { unique: true });
// Symmetric uniqueness: prevents both A→B and B→A from existing
messageRequestSchema.index(
  { participants: 1 },
  { unique: true, partialFilterExpression: { participants: { $exists: true, $ne: [] } } }
);

export default mongoose.model('MessageRequest', messageRequestSchema);

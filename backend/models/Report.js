import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    targetType: {
      type: String,
      required: [true, 'Report target type is required'],
      enum: ['user', 'pod'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Report target ID is required'],
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for reporting'],
    },
    details: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;

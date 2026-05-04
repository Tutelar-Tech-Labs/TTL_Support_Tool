import mongoose from 'mongoose';

const compOffRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MongoUser',
      required: true,
    },
    dateWorked: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    adminComment: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MongoUser',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedOnLeaveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Leave',
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

compOffRequestSchema.index({ userId: 1, dateWorked: 1 }, { unique: true });

const CompOffRequest = mongoose.model('CompOffRequest', compOffRequestSchema);

export default CompOffRequest;

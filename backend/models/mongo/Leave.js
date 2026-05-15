import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MongoUser',
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['Planned', 'Sick', 'CompOff', 'HalfDay'],
      required: true,
    },
    halfDayPeriod: {
      type: String,
      enum: ['Morning', 'Afternoon', null],
      default: null,
    },
    fromDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    toDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: '',
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
  },
  {
    timestamps: true,
  }
);

leaveSchema.index({ userId: 1, createdAt: -1 });

const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;

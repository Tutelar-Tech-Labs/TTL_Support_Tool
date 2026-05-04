import mongoose from 'mongoose';

const holidayWorkPermissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MongoUser',
      required: true,
    },
    holidayDate: {
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
    }
  },
  {
    timestamps: true,
  }
);

// One permission request per user per holiday date
holidayWorkPermissionSchema.index({ userId: 1, holidayDate: 1 }, { unique: true });

const HolidayWorkPermission = mongoose.model('HolidayWorkPermission', holidayWorkPermissionSchema);

export default HolidayWorkPermission;

import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MongoUser', // Updated ref
      required: true,
    },
    date: {
      type: String, // Store as YYYY-MM-DD string
      required: true,
    },
    workLocation: {
      type: String,
      enum: ['Work from Home', 'Office', 'Client'],
      required: true,
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one attendance record per employee per date
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;

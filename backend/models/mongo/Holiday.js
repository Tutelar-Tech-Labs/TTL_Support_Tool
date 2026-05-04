import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Holiday title is required'],
      trim: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Holiday date is required'],
    },
    type: {
      type: String,
      enum: ['National', 'Regional', 'Company'],
      required: true,
      default: 'National',
    },
    location: {
      type: String,
      default: 'All', // Can be specific city/office
    },
    department: {
      type: String,
      default: 'All',
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MongoUser',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster searching by date
holidaySchema.index({ date: 1 });

const Holiday = mongoose.model('Holiday', holidaySchema);

export default Holiday;

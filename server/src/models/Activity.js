import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    apiKey: {
      type: String,
      default: null,
      trim: true
    },
    activity: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    participants: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      default: 0
    },
    availability: {
      type: Number,
      default: 0.5
    },
    accessibility: {
      type: String,
      default: 'Few to no challenges'
    },
    duration: {
      type: String,
      default: 'hours'
    },
    kidFriendly: {
      type: Boolean,
      default: true
    },
    link: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['saved', 'done', 'skipped'],
      default: 'saved',
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    isCustom: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Prevent saving the exact same external API activity twice for the same user
activitySchema.index(
  { user: 1, apiKey: 1 },
  {
    unique: true,
    partialFilterExpression: { apiKey: { $type: 'string', $gt: '' } }
  }
);

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;


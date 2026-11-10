import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    weekStart: {
      type: Date,
      required: true
    },
    weekEnd: {
      type: Date,
      required: true
    },
    activities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity'
      }
    ],
    goal: {
      type: Number,
      required: true,
      default: 3,
      min: 1
    },
    completedCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'failed'],
      default: 'active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

const Challenge = mongoose.model('Challenge', challengeSchema);
export default Challenge;

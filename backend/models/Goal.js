import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moduleSlug: {
    type: String,
    required: [true, 'Module slug is required']
  },
  moduleName: {
    type: String,
    required: [true, 'Module name is required']
  },
  goalText: {
    type: String,
    required: [true, 'Goal text is required']
  },
  goalId: {
    type: String,
    required: [true, 'Goal ID is required']
  },
  status: {
    type: String,
    enum: ['selected', 'in_progress', 'completed', 'abandoned'],
    default: 'selected'
  },
  selectedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
});

// Compound index
goalSchema.index({ user: 1, moduleSlug: 1, goalId: 1 }, { unique: true });

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;

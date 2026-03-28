import mongoose from 'mongoose';

const scaleResponseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scaleId: {
    type: String,
    required: [true, 'Scale ID is required'],
    enum: ['child-mental-health', 'parental-self-efficacy', 'parent-child-relationship', 'parental-mental-wellbeing']
  },
  scaleName: {
    type: String,
    required: [true, 'Scale name is required']
  },
  responses: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Responses are required']
  },
  totalScore: {
    type: Number,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['Low Risk', 'Medium Risk', 'High Risk', 'Very High Risk'],
    default: 'Unknown'
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  timeTaken: {
    type: Number, // in minutes
    required: false,
    default: 0
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  recommendations: [{
    id: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    description: {
      type: String,
      required: true
    },
    estimatedDuration: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['recommended', 'in_progress', 'completed'],
      default: 'recommended'
    }
  }]
});

// Compound index to ensure user can only take each scale once per day
scaleResponseSchema.index({ user: 1, scaleId: 1, completedAt: 1 }, { unique: true });

const ScaleResponse = mongoose.model('ScaleResponse', scaleResponseSchema);

export default ScaleResponse;

import mongoose from 'mongoose';

const moduleRecommendationSchema = new mongoose.Schema({
  scaleId: {
    type: String,
    required: true,
    enum: ['child-mental-health', 'parenting-stress', 'anxiety-assessment']
  },
  scoreRange: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  recommendedModules: [{
    moduleSlug: {
      type: String,
      required: true
    },
    moduleName: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    reason: {
      type: String,
      required: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient queries
moduleRecommendationSchema.index({ scaleId: 1, 'scoreRange.min': 1, 'scoreRange.max': 1 });

const ModuleRecommendation = mongoose.model('ModuleRecommendation', moduleRecommendationSchema);
export default ModuleRecommendation;

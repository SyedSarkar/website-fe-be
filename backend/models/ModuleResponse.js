import mongoose from 'mongoose';

const moduleResponseSchema = new mongoose.Schema({
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
  pageSlug: {
    type: String,
    required: [true, 'Page slug is required']
  },
  responseType: {
    type: String,
    enum: ['checking-in', 'scale', 'quiz', 'goal', 'activity'],
    required: true
  },
  responses: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Responses are required']
  },
  score: {
    type: Number,
    default: null
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to allow multiple responses per module but track individually
moduleResponseSchema.index({ user: 1, moduleSlug: 1, pageSlug: 1, responseType: 1, completedAt: -1 });

const ModuleResponse = mongoose.model('ModuleResponse', moduleResponseSchema);

export default ModuleResponse;

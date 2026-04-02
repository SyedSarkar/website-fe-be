import mongoose from 'mongoose';

const quizResponseSchema = new mongoose.Schema({
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
  quizId: {
    type: String,
    required: [true, 'Quiz ID is required']
  },
  answers: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Answers are required']
  },
  score: {
    type: Number,
    default: null
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    default: null
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  }
});

// Compound index - one quiz response per module quiz per user
quizResponseSchema.index({ user: 1, moduleSlug: 1, quizId: 1 }, { unique: true });

const QuizResponse = mongoose.model('QuizResponse', quizResponseSchema);

export default QuizResponse;

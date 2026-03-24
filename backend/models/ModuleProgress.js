import mongoose from 'mongoose';

const moduleProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moduleSlug: {
    type: String,
    required: true
  },
  moduleName: {
    type: String,
    required: true
  },
  currentPage: {
    type: Number,
    default: 0
  },
  totalPages: {
    type: Number,
    required: true
  },
  completedPages: [{
    type: String
  }],
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// Compound index to ensure user can only have one progress record per module
moduleProgressSchema.index({ user: 1, moduleSlug: 1 }, { unique: true });

// Update completion status and calculate progress
moduleProgressSchema.pre('save', function(next) {
  // Calculate progress percentage
  const progressPercentage = this.totalPages > 0 
    ? Math.round((this.completedPages.length / this.totalPages) * 100)
    : 0;
  
  // Update completion status
  this.isCompleted = this.completedPages.length === this.totalPages;
  
  // Set completion date if just completed
  if (this.isCompleted && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

const ModuleProgress = mongoose.model('ModuleProgress', moduleProgressSchema);
export default ModuleProgress;

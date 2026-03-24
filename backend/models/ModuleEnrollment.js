import mongoose from 'mongoose';

const moduleEnrollmentSchema = new mongoose.Schema({
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
  enrollmentSource: {
    type: String,
    enum: ['manual', 'recommended', 'auto'],
    default: 'manual'
  },
  recommendedBy: {
    type: String, // scaleId that triggered recommendation
    required: false
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['enrolled', 'in_progress', 'completed', 'dropped'],
    default: 'enrolled'
  },
  progress: {
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
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0
    }
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  droppedAt: {
    type: Date
  }
});

// Compound index to ensure user can only be enrolled once per module
moduleEnrollmentSchema.index({ user: 1, moduleSlug: 1 }, { unique: true });

// Update progress percentage and status
moduleEnrollmentSchema.pre('save', function(next) {
  // Calculate progress percentage
  if (this.progress.totalPages > 0) {
    this.progress.percentage = Math.round((this.progress.completedPages.length / this.progress.totalPages) * 100);
  }
  
  // Update status based on progress
  if (this.progress.percentage === 100) {
    this.status = 'completed';
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  } else if (this.progress.percentage > 0) {
    this.status = 'in_progress';
  }
  
  // Update last accessed time
  this.lastAccessed = new Date();
  
  next();
});

const ModuleEnrollment = mongoose.model('ModuleEnrollment', moduleEnrollmentSchema);

export default ModuleEnrollment;

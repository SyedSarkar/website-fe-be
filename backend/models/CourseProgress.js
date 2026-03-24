import mongoose from 'mongoose';

const courseProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  currentModule: {
    type: Number,
    default: 0
  },
  completedModules: [{
    moduleId: {
      type: Number,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0
    }
  }],
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  totalTimeSpent: {
    type: Number, // in minutes
    default: 0
  }
});

// Compound index to ensure user can only have one progress record per course
courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

// Update progress percentage before saving
courseProgressSchema.pre('save', function(next) {
  if (this.completedModules && this.course) {
    // This will be populated when we have the course reference
    const totalModules = this.completedModules.length;
    // We'll calculate this properly when we have course data
    this.progressPercentage = Math.min(100, (totalModules / 5) * 100); // Assuming 5 modules avg
  }
  
  // Update status based on progress
  if (this.progressPercentage === 0) {
    this.status = 'Not Started';
  } else if (this.progressPercentage === 100) {
    this.status = 'Completed';
    this.completedAt = new Date();
  } else {
    this.status = 'In Progress';
  }
  
  next();
});

const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema);
export default CourseProgress;

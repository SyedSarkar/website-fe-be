import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Course title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [500, 'Course description cannot be more than 500 characters']
  },
  estimatedDuration: {
    type: String,
    required: [true, 'Estimated duration is required'],
    maxlength: [50, 'Duration cannot be more than 50 characters']
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  category: {
    type: String,
    enum: ['Parenting Skills', 'Mental Health', 'Child Development', 'Stress Management', 'Communication'],
    required: [true, 'Course category is required']
  },
  targetScoreRange: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  modules: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    estimatedMinutes: {
      type: Number,
      default: 30
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

// Sort modules by order
courseSchema.pre('save', function(next) {
  if (this.modules) {
    this.modules.sort((a, b) => a.order - b.order);
  }
  next();
});

const Course = mongoose.model('Course', courseSchema);
export default Course;

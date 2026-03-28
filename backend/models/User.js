import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  surname: {
    type: String,
    trim: true,
    maxlength: [50, 'Surname cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // Onboarding Status
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  onboardingStep: {
    type: Number,
    default: 0
  },
  
  // Eligibility
  eligibility: {
    isEligible: {
      type: Boolean,
      default: false
    },
    reason: {
      type: String,
      enum: ['yes', 'under_12', 'over_17', 'professional', null],
      default: null
    }
  },
  
  // Personal Info (About You)
  personalInfo: {
    age: {
      type: Number,
      min: [18, 'Must be at least 18 years old'],
      max: [100, 'Age must be less than 100']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non_binary', 'prefer_not_to_say', 'other']
    },
    city: {
      type: String,
      trim: true
    },
    postcode: {
      type: String,
      trim: true
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    alternativeContact: {
      type: String,
      trim: true
    }
  },
  
  // Family Info (About Your Family)
  familyInfo: {
    ethnicity: {
      type: String,
      enum: [
        'punjabi', 'sindhi', 'pashtun', 'balochi', 'muhajir', 
        'kashmiri', 'hazara', 'other', 'prefer_not_to_say'
      ]
    },
    ethnicityOther: {
      type: String,
      trim: true
    },
    relationshipStatus: {
      type: String,
      enum: ['single', 'married', 'widowed', 'divorced', 'separated', 'other']
    },
    education: {
      type: String,
      enum: [
        'no_formal_education',
        'primary',
        'middle',
        'matric',
        'intermediate',
        'bachelors',
        'masters',
        'phd',
        'other'
      ]
    },
    householdIncome: {
      type: String,
      enum: [
        'under_25000',
        '25000_50000',
        '50000_100000',
        '100000_200000',
        'over_200000',
        'prefer_not_to_say'
      ]
    },
    covidImpact: [{
      type: String,
      enum: [
        'job_loss_one_parent',
        'job_loss_both_parents',
        'reduced_hours_one',
        'reduced_hours_both',
        'difficulty_paying_bills',
        'longer_work_hours',
        'applied_govt_assistance',
        'received_govt_assistance',
        'none'
      ]
    }]
  },
  
  // Teenager Info (About Your Teenager)
  teenInfo: {
    firstName: {
      type: String,
      trim: true
    },
    dateOfBirth: {
      type: Date
    },
    age: {
      type: Number,
      min: 12,
      max: 17
    },
    schoolGrade: {
      type: String,
      enum: [
        'grade_6', 'grade_7', 'grade_8', 'grade_9', 
        'grade_10', 'grade_11', 'grade_12', 'not_attending'
      ]
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non_binary', 'prefer_not_to_say']
    },
    relationship: {
      type: String,
      enum: [
        'biological_mother',
        'biological_father',
        'step_mother',
        'step_father',
        'adoptive_mother',
        'adoptive_father',
        'grandmother',
        'grandfather',
        'guardian',
        'other'
      ]
    },
    otherParentInProgram: {
      type: String,
      enum: ['yes', 'no', 'maybe']
    }
  },
  
  // Consent
  consent: {
    given: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date
    },
    acceptedTerms: {
      type: Boolean,
      default: false
    },
    acceptedPrivacy: {
      type: Boolean,
      default: false
    },
    acceptedResearch: {
      type: Boolean,
      default: false
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (and not already hashed)
  if (!this.isModified('password')) return next();
  
  // Check if password is already hashed (starts with $2a$)
  if (this.password.startsWith('$2a$')) return next();
  
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

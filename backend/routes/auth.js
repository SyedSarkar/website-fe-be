import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register user
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin,
          onboardingCompleted: user.onboardingCompleted,
          onboardingStep: user.onboardingStep,
          eligibility: user.eligibility,
          personalInfo: user.personalInfo,
          familyInfo: user.familyInfo,
          teenInfo: user.teenInfo,
          consent: user.consent
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get current user (protected route)
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          onboardingCompleted: user.onboardingCompleted,
          onboardingStep: user.onboardingStep,
          eligibility: user.eligibility,
          personalInfo: user.personalInfo,
          familyInfo: user.familyInfo,
          teenInfo: user.teenInfo,
          consent: user.consent
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update onboarding progress (protected route)
router.patch('/onboarding', protect, async (req, res, next) => {
  try {
    const {
      onboardingStep,
      onboardingCompleted,
      eligibility,
      personalInfo,
      familyInfo,
      teenInfo,
      consent
    } = req.body;

    // Helper function to remove empty strings from an object
    const cleanEmptyStrings = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== '' && value !== undefined) {
          cleaned[key] = value;
        }
      }
      return cleaned;
    };

    // Build update object dynamically
    const updateFields = {};
    
    if (onboardingStep !== undefined) updateFields.onboardingStep = onboardingStep;
    if (onboardingCompleted !== undefined) updateFields.onboardingCompleted = onboardingCompleted;
    if (eligibility) updateFields.eligibility = cleanEmptyStrings(eligibility);
    if (personalInfo) updateFields.personalInfo = cleanEmptyStrings(personalInfo);
    if (familyInfo) updateFields.familyInfo = cleanEmptyStrings(familyInfo);
    if (teenInfo) updateFields.teenInfo = cleanEmptyStrings(teenInfo);
    if (consent) {
      updateFields.consent = {
        ...cleanEmptyStrings(consent),
        date: consent.given ? new Date() : consent.date
      };
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          onboardingStep: user.onboardingStep,
          eligibility: user.eligibility,
          personalInfo: user.personalInfo,
          familyInfo: user.familyInfo,
          teenInfo: user.teenInfo,
          consent: user.consent
        }
      }
    });
  } catch (error) {
    console.error('Onboarding update error:', error.message, error.stack);
    next(error);
  }
});

export default router;

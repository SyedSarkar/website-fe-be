import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.patch('/profile', protect, async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (name) {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { name },
        { new: true, runValidators: true }
      );
      
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    } else {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide name to update'
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

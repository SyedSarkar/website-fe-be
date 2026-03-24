import express from 'express';
import Course from '../models/Course.js';
import CourseProgress from '../models/CourseProgress.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Get all available courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true })
      .sort({ priority: 1, difficulty: 1 });
    
    res.json({
      status: 'success',
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch courses'
    });
  }
});

// Get course by ID
router.get('/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    res.json({
      status: 'success',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch course'
    });
  }
});

// Enroll user in a course
router.post('/:courseId/enroll', async (req, res) => {
  try {
    const userId = req.user._id;
    const courseId = req.params.courseId;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    // Check if user is already enrolled
    const existingProgress = await CourseProgress.findOne({ user: userId, course: courseId });
    if (existingProgress) {
      return res.status(400).json({
        status: 'error',
        message: 'Already enrolled in this course'
      });
    }

    // Create new course progress
    const courseProgress = await CourseProgress.create({
      user: userId,
      course: courseId,
      status: 'Not Started',
      progressPercentage: 0
    });

    res.status(201).json({
      status: 'success',
      message: 'Successfully enrolled in course',
      data: courseProgress
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to enroll in course'
    });
  }
});

// Get user's course progress
router.get('/my/progress', async (req, res) => {
  try {
    const userId = req.user._id;
    
    const courseProgress = await CourseProgress.find({ user: userId })
      .populate('course')
      .sort({ enrolledAt: -1 });

    res.json({
      status: 'success',
      data: courseProgress
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch course progress'
    });
  }
});

// Get specific course progress
router.get('/:courseId/progress', async (req, res) => {
  try {
    const userId = req.user._id;
    const courseId = req.params.courseId;
    
    const courseProgress = await CourseProgress.findOne({ user: userId, course: courseId })
      .populate('course');

    if (!courseProgress) {
      return res.status(404).json({
        status: 'error',
        message: 'Course progress not found'
      });
    }

    res.json({
      status: 'success',
      data: courseProgress
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch course progress'
    });
  }
});

// Update course progress (mark module as complete)
router.put('/:courseId/progress', async (req, res) => {
  try {
    const userId = req.user._id;
    const courseId = req.params.courseId;
    const { moduleId, timeSpent } = req.body;

    const courseProgress = await CourseProgress.findOne({ user: userId, course: courseId })
      .populate('course');

    if (!courseProgress) {
      return res.status(404).json({
        status: 'error',
        message: 'Course progress not found'
      });
    }

    // Check if module is already completed
    const alreadyCompleted = courseProgress.completedModules.find(
      cm => cm.moduleId === moduleId
    );

    if (!alreadyCompleted) {
      // Add module to completed modules
      courseProgress.completedModules.push({
        moduleId,
        completedAt: new Date(),
        timeSpent: timeSpent || 0
      });
    }

    // Update current module to next one
    const totalModules = courseProgress.course.modules.length;
    const nextModule = Math.min(moduleId + 1, totalModules - 1);
    courseProgress.currentModule = nextModule;

    // Calculate progress percentage
    courseProgress.progressPercentage = Math.round(
      (courseProgress.completedModules.length / totalModules) * 100
    );

    // Update total time spent
    courseProgress.totalTimeSpent += timeSpent || 0;

    // Update status
    if (courseProgress.progressPercentage === 100) {
      courseProgress.status = 'Completed';
      courseProgress.completedAt = new Date();
    } else if (courseProgress.progressPercentage > 0) {
      courseProgress.status = 'In Progress';
    }

    await courseProgress.save();

    res.json({
      status: 'success',
      message: 'Progress updated successfully',
      data: courseProgress
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update progress'
    });
  }
});

// Get course module content
router.get('/:courseId/modules/:moduleId', async (req, res) => {
  try {
    const userId = req.user._id;
    const courseId = req.params.courseId;
    const moduleId = parseInt(req.params.moduleId);

    // Check if user is enrolled
    const courseProgress = await CourseProgress.findOne({ user: userId, course: courseId });
    if (!courseProgress) {
      return res.status(403).json({
        status: 'error',
        message: 'Not enrolled in this course'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    // Find the specific module
    const module = course.modules.find(m => m.order === moduleId);
    if (!module) {
      return res.status(404).json({
        status: 'error',
        message: 'Module not found'
      });
    }

    // Check if user can access this module (sequential access)
    if (moduleId > courseProgress.currentModule) {
      return res.status(403).json({
        status: 'error',
        message: 'Previous modules must be completed first'
      });
    }

    res.json({
      status: 'success',
      data: {
        module,
        courseTitle: course.title,
        totalModules: course.modules.length,
        currentModule: courseProgress.currentModule,
        progressPercentage: courseProgress.progressPercentage
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch module content'
    });
  }
});

// Get course recommendations based on user's assessment
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's latest scale responses
    const ScaleResponse = require('../models/ScaleResponse');
    const scaleResponses = await ScaleResponse.find({ user: userId })
      .sort({ completedAt: -1 })
      .limit(1); // Get latest assessment

    if (scaleResponses.length === 0) {
      return res.json({
        status: 'success',
        data: []
      });
    }

    const averageScore = scaleResponses[0].totalScore;

    // Find courses that match the user's score range
    const courses = await Course.find({
      targetScoreRange: {
        $gte: Math.floor(averageScore - 5),
        $lte: Math.ceil(averageScore + 5)
      },
      isActive: true
    }).sort({ priority: 1, difficulty: 1 });

    res.json({
      status: 'success',
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get course recommendations'
    });
  }
});

export default router;

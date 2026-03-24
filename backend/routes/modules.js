import express from 'express';
import ModuleEnrollment from '../models/ModuleEnrollment.js';
import ModuleRecommendation from '../models/ModuleRecommendation.js';
import ScaleResponse from '../models/ScaleResponse.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Enroll user in a module
router.post('/enroll', async (req, res) => {
  try {
    const { moduleSlug, moduleName, totalPages } = req.body;
    const userId = req.user._id;
    
    console.log('📝 Enrollment request:', { moduleSlug, moduleName, totalPages, userId });

    // Validate required fields
    if (!moduleSlug || !moduleName || totalPages === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Module slug, name, and total pages are required'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await ModuleEnrollment.findOne({ 
      user: userId, 
      moduleSlug 
    });

    if (existingEnrollment) {
      return res.status(400).json({
        status: 'error',
        message: 'User is already enrolled in this module'
      });
    }

    // Create enrollment
    const enrollment = await ModuleEnrollment.create({
      user: userId,
      moduleSlug,
      moduleName,
      status: 'enrolled',
      progress: {
        totalPages,
        currentPage: 0,
        completedPages: [],
        percentage: 0,
        timeSpent: 0
      },
      enrollmentSource: 'manual'
    });

    res.status(201).json({
      status: 'success',
      message: 'Successfully enrolled in module',
      data: enrollment
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to enroll in module'
    });
  }
});

// Update user's progress
router.post('/progress', async (req, res) => {
  try {
    const { moduleSlug, moduleName, currentPage, totalPages, completedPages, timeSpent } = req.body;
    const userId = req.user._id;
    
    console.log('📈 Progress update request:', { 
      moduleSlug, 
      moduleName, 
      currentPage, 
      totalPages, 
      completedPages: completedPages?.length || 0, 
      userId 
    });

    // Validate required fields
    if (!moduleSlug || !moduleName || totalPages === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Module slug, name, and total pages are required'
      });
    }

    // Find or create enrollment
    const enrollment = await ModuleEnrollment.findOneAndUpdate(
      { user: userId, moduleSlug },
      {
        moduleName,
        status: 'in_progress',
        progress: {
          currentPage: currentPage || 0,
          totalPages,
          completedPages: completedPages || [],
          percentage: Math.round(((completedPages || []).length / totalPages) * 100),
          timeSpent: timeSpent || 0
        },
        lastAccessed: new Date(),
        enrollmentSource: 'manual'
      },
      { upsert: true, new: true }
    ).populate('user', 'name email');

    res.json({
      status: 'success',
      message: 'Progress updated successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update progress'
    });
  }
});

// Get user's module enrollments
router.get('/enrollments', async (req, res) => {
  try {
    const userId = req.user.id;
    const enrollments = await ModuleEnrollment.find({ user: userId })
      .sort({ enrolledAt: -1 })
      .populate('user', 'name email');

    res.json({
      status: 'success',
      data: enrollments
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch enrollments'
    });
  }
});

// Get recommendations based on scale scores
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's latest scale responses
    const scaleResponses = await ScaleResponse.find({ user: userId })
      .sort({ completedAt: -1 })
      .limit(3); // Get last 3 responses

    if (scaleResponses.length === 0) {
      return res.json({
        status: 'success',
        data: []
      });
    }

    const recommendations = [];

    // For each scale response, find matching recommendations
    for (const response of scaleResponses) {
      const moduleRecs = await ModuleRecommendation.find({
        scaleId: response.scaleId,
        isActive: true,
        scoreRange: {
          $lte: response.totalScore
        }
      });

      for (const rec of moduleRecs) {
        // Check if user is already enrolled
        const alreadyEnrolled = await ModuleEnrollment.findOne({
          user: userId,
          moduleSlug: { $in: rec.recommendedModules.map(m => m.moduleSlug) }
        });

        if (!alreadyEnrolled) {
          recommendations.push({
            scaleId: response.scaleId,
            scaleName: response.scaleName,
            userScore: response.totalScore,
            recommendedModules: rec.recommendedModules,
            completedAt: response.completedAt
          });
        }
      }
    }

    res.json({
      status: 'success',
      data: recommendations
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch recommendations'
    });
  }
});

// Auto-enroll user in recommended modules
router.post('/auto-enroll', async (req, res) => {
  try {
    const { scaleId, moduleSlugs } = req.body;
    const userId = req.user.id;

    if (!scaleId || !moduleSlugs || !Array.isArray(moduleSlugs)) {
      return res.status(400).json({
        status: 'error',
        message: 'Scale ID and module slugs array are required'
      });
    }

    const enrollments = [];

    for (const moduleSlug of moduleSlugs) {
      // Check if already enrolled
      const existing = await ModuleEnrollment.findOne({
        user: userId,
        moduleSlug
      });

      if (!existing) {
        // Get module info (you might need to adjust this based on your module data structure)
        const moduleName = moduleSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        const enrollment = await ModuleEnrollment.create({
          user: userId,
          moduleSlug,
          moduleName,
          progress: {
            totalPages: 8, // Default, adjust as needed
            currentPage: 0,
            completedPages: [],
            percentage: 0,
            timeSpent: 0
          },
          enrollmentSource: 'recommended',
          recommendedBy: scaleId
        });

        enrollments.push(enrollment);
      }
    }

    res.status(201).json({
      status: 'success',
      message: `Successfully enrolled in ${enrollments.length} recommended modules`,
      data: enrollments
    });
  } catch (error) {
    console.error('Auto-enrollment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to auto-enroll in modules'
    });
  }
});

// Get user's module progress
router.get('/my-progress', async (req, res) => {
  try {
    const userId = req.user._id;
    
    const enrollments = await ModuleEnrollment.find({ user: userId })
      .sort({ lastAccessed: -1 });

    res.json({
      status: 'success',
      data: enrollments.map(enrollment => ({
        moduleSlug: enrollment.moduleSlug,
        moduleName: enrollment.moduleName,
        currentPage: enrollment.progress.currentPage,
        totalPages: enrollment.progress.totalPages,
        completedPages: enrollment.progress.completedPages,
        percentage: enrollment.progress.percentage,
        timeSpent: enrollment.progress.timeSpent,
        lastAccessed: enrollment.lastAccessed,
        status: enrollment.status
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching user progress:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user progress'
    });
  }
});

// Update time spent on a module
router.post('/time-spent', async (req, res) => {
  try {
    const { moduleSlug, additionalTime } = req.body;
    const userId = req.user._id;
    
    // Validate required fields
    if (!moduleSlug || additionalTime === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Module slug and additional time are required'
      });
    }

    // Find and update the enrollment
    const enrollment = await ModuleEnrollment.findOne({ 
      user: userId, 
      moduleSlug 
    });

    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Module enrollment not found'
      });
    }

    // Update time spent
    enrollment.progress.timeSpent += additionalTime;
    enrollment.lastAccessed = new Date();
    await enrollment.save();

    res.json({
      status: 'success',
      message: 'Time spent updated successfully',
      data: {
        totalTimeSpent: enrollment.progress.timeSpent
      }
    });
  } catch (error) {
    console.error('❌ Error updating time spent:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update time spent'
    });
  }
});

export default router;

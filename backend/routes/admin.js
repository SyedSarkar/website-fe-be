import express from 'express';
import User from '../models/User.js';
import ScaleResponse from '../models/ScaleResponse.js';
import ModuleEnrollment from '../models/ModuleEnrollment.js';
import ModuleRecommendation from '../models/ModuleRecommendation.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(authorize('admin'));

// Get admin dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalScaleResponses = await ScaleResponse.countDocuments();
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt lastLogin');
    
    const scaleStats = await ScaleResponse.aggregate([
      {
        $group: {
          _id: '$scaleId',
          count: { $sum: 1 },
          avgScore: { $avg: '$totalScore' }
        }
      }
    ]);

    // Get module progress statistics
    const enrollmentStats = await ModuleEnrollment.aggregate([
      {
        $group: {
          _id: '$moduleSlug',
          totalEnrollments: { $sum: 1 },
          completedEnrollments: { 
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          inProgressEnrollments: { 
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          avgProgress: { $avg: '$progress.percentage' },
          avgTimeSpent: { $avg: '$progress.timeSpent' }
        }
      }
    ]);

    // Get detailed user engagement metrics
    const engagementMetrics = await ModuleEnrollment.aggregate([
      {
        $group: {
          _id: '$user',
          totalModulesEnrolled: { $sum: 1 },
          modulesCompleted: { 
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalProgress: { $sum: '$progress.percentage' },
          totalTimeSpent: { $sum: '$progress.timeSpent' },
          lastActivity: { $max: '$lastAccessed' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          userName: '$userInfo.name',
          userEmail: '$userInfo.email',
          totalModulesEnrolled: 1,
          modulesCompleted: 1,
          avgProgress: { $divide: ['$totalProgress', '$totalModulesEnrolled'] },
          totalTimeSpent: 1,
          lastActivity: 1,
          completionRate: { 
            $multiply: [{ $divide: ['$modulesCompleted', '$totalModulesEnrolled'] }, 100] 
          }
        }
      }
    ]);

    // Get risk level distribution from scale responses
    const riskDistribution = await ScaleResponse.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ['$totalScore', 20] }, then: 'Low Risk' },
                { case: { $lte: ['$totalScore', 30] }, then: 'Medium Risk' },
                { case: { $lte: ['$totalScore', 40] }, then: 'High Risk' }
              ],
              default: 'Very High Risk'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get activity trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activityTrends = await ModuleEnrollment.aggregate([
      {
        $match: {
          lastAccessed: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastAccessed" } },
          activeUsers: { $addToSet: "$user" },
          totalAccesses: { $sum: 1 }
        }
      },
      {
        $project: {
          date: '$_id',
          activeUsersCount: { $size: "$activeUsers" },
          totalAccesses: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({
      status: 'success',
      data: {
        totalUsers,
        totalScaleResponses,
        recentUsers,
        scaleStats,
        enrollmentStats,
        engagementMetrics,
        riskDistribution,
        activityTrends
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch admin statistics'
    });
  }
});

// Create new user
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Create user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create user'
    });
  }
});

// Update user
router.patch('/users/:userId', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const userId = req.params.userId;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already exists'
        });
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user'
    });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Don't allow admin to delete themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot delete your own account'
      });
    }

    // Delete user and their scale responses
    await ScaleResponse.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user'
    });
  }
});

// Reset user password
router.post('/users/:userId/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.params.userId;

    if (!newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide new password'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Hash new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset password'
    });
  }
});

// Get user performance and recommendations
router.get('/users/:userId/performance', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get all scale responses for this user
    const scaleResponses = await ScaleResponse.find({ user: userId })
      .sort({ completedAt: -1 });

    // Calculate performance metrics
    const totalScore = scaleResponses.reduce((sum, response) => sum + response.totalScore, 0);
    const averageScore = scaleResponses.length > 0 ? totalScore / scaleResponses.length : 0;
    const completionCount = scaleResponses.length;
    const lastCompletion = scaleResponses.length > 0 ? scaleResponses[0].completedAt : null;

    // Simple recommendations based on risk level
    const recommendations = averageScore <= 15 
      ? ['Connect module', 'Family Rules module'] 
      : averageScore <= 25 
        ? ['Parenting in Pandemic module', 'Conflict module'] 
        : ['Anxiety module', 'Seeking Help module'];

    // Get module enrollments for this user
    const moduleEnrollments = await ModuleEnrollment.find({ user: req.params.userId })
      .sort({ enrolledAt: -1 })
      .populate('user', 'name email');

    res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        performance: {
          totalScore,
          averageScore,
          completionCount,
          lastCompletion,
          recommendations,
          riskLevel: averageScore <= 15 ? 'Low Risk' : averageScore <= 25 ? 'Moderate Risk' : 'High Risk'
        },
        scaleResponses,
        moduleEnrollments
      }
    });
  } catch (error) {
    console.error('Performance fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user performance'
    });
  }
});

// Get all users performance data
router.get('/performance', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('name email role createdAt lastLogin')
      .sort({ createdAt: -1 });

    // Get scale responses and module enrollments in parallel
    const [scaleResponses, moduleEnrollments] = await Promise.all([
      ScaleResponse.find({}).populate('user', 'name email'),
      ModuleEnrollment.find({}).populate('user', 'name email')
    ]);

    // Combine data for each user
    const userPerformance = users.map(user => {
      const userScaleResponses = scaleResponses.filter(response => 
        response.user && response.user._id && response.user._id.toString() === user._id.toString()
      );
      
      const userEnrollments = moduleEnrollments.filter(enrollment => 
        enrollment.user && enrollment.user._id && enrollment.user._id.toString() === user._id.toString()
      );

      const totalScore = userScaleResponses.reduce((sum, response) => sum + response.totalScore, 0);
      const averageScore = userScaleResponses.length > 0 ? totalScore / userScaleResponses.length : 0;
      const completionCount = userScaleResponses.length;
      const lastCompletion = userScaleResponses.length > 0 ? userScaleResponses[0].completedAt : null;

      // Simple recommendations based on risk level
      const recommendations = averageScore <= 15 
        ? ['Connect module', 'Family Rules module'] 
        : averageScore <= 25 
          ? ['Parenting in Pandemic module', 'Conflict module'] 
          : ['Anxiety module', 'Seeking Help module'];

      const inProgressModules = userEnrollments.filter(e => e.status === 'in_progress');
      
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        performance: {
          totalScore,
          averageScore,
          completionCount,
          lastCompletion,
          recommendations,
          moduleCount: userEnrollments.length,
          completedModules: userEnrollments.filter(e => e.status === 'completed').length,
          inProgressModules: inProgressModules.length,
          inProgressModulesDetails: inProgressModules.map(enrollment => ({
            moduleSlug: enrollment.moduleSlug,
            moduleName: enrollment.moduleName,
            progress: enrollment.progress.percentage,
            completedPages: enrollment.progress.completedPages.length,
            totalPages: enrollment.progress.totalPages,
            currentPage: enrollment.progress.currentPage
          }))
        }
      };
    });

    res.json({
      status: 'success',
      data: userPerformance
    });
  } catch (error) {
    console.error('Performance data error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch performance data'
    });
  }
});

// Get all users with pagination and filtering
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('name email role createdAt lastLogin onboardingCompleted onboardingStep eligibility personalInfo familyInfo teenInfo consent')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
});

// Get specific user details with their scale responses
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name email role createdAt lastLogin');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const scaleResponses = await ScaleResponse.find({ user: req.params.userId })
      .sort({ completedAt: -1 })
      .select('scaleId scaleName totalScore responses completedAt timeTaken');

    // Get module progress for this user
    const moduleEnrollments = await ModuleEnrollment.find({ user: req.params.userId })
      .sort({ enrolledAt: -1 })
      .populate('user', 'name email');

    res.json({
      status: 'success',
      data: {
        user,
        scaleResponses,
        moduleEnrollments
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user details'
    });
  }
});

// Get all module progress with user details
router.get('/module-progress', async (req, res) => {
  try {
    const { page = 1, limit = 20, moduleSlug, userId } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (moduleSlug) query.moduleSlug = moduleSlug;
    if (userId) query.user = userId;

    const progress = await ModuleEnrollment.find(query)
      .populate('user', 'name email')
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ModuleEnrollment.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        progress,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch module progress'
    });
  }
});

router.get('/module-enrollments', async (req, res) => {
  try {
    const { page = 1, limit = 20, moduleSlug, userId, status } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (moduleSlug) query.moduleSlug = moduleSlug;
    if (userId) query.user = userId;
    if (status) query.status = status;

    const enrollments = await ModuleEnrollment.find(query)
      .populate('user', 'name email')
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ModuleEnrollment.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        enrollments,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch module enrollments'
    });
  }
});

// Create module recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { scaleId, scoreRange, recommendedModules } = req.body;

    // Validate input
    if (!scaleId || !scoreRange || !recommendedModules) {
      return res.status(400).json({
        status: 'error',
        message: 'Scale ID, score range, and recommended modules are required'
      });
    }

    const recommendation = await ModuleRecommendation.create({
      scaleId,
      scoreRange,
      recommendedModules,
      isActive: true
    });

    res.status(201).json({
      status: 'success',
      message: 'Module recommendation created successfully',
      data: recommendation
    });
  } catch (error) {
    console.error('Recommendation creation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create recommendation'
    });
  }
});

// Get all module recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const recommendations = await ModuleRecommendation.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch recommendations'
    });
  }
});

// Get all scale responses with user details
router.get('/responses', async (req, res) => {
  try {
    const { page = 1, limit = 20, scaleId, userId } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (scaleId) query.scaleId = scaleId;
    if (userId) query.user = userId;

    const responses = await ScaleResponse.find(query)
      .populate('user', 'name email')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ScaleResponse.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        responses,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch scale responses'
    });
  }
});

// Export user data
router.get('/export/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role createdAt lastLogin')
      .sort({ createdAt: -1 });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');

    const csv = [
      ['Name', 'Email', 'Role', 'Created At', 'Last Login'].join(','),
      ...users.map(user => [
        user.name,
        user.email,
        user.role,
        user.createdAt,
        user.lastLogin || 'Never'
      ].join(','))
    ].join('\n');

    res.send(csv);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to export users'
    });
  }
});

// Export scale responses
router.get('/export/responses', async (req, res) => {
  try {
    const responses = await ScaleResponse.find()
      .populate('user', 'name email')
      .sort({ completedAt: -1 });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=scale-responses.csv');

    const csv = [
      ['User Name', 'User Email', 'Scale ID', 'Scale Name', 'Total Score', 'Completed At', 'Time Taken (seconds)'].join(','),
      ...responses.map(response => [
        response.user.name,
        response.user.email,
        response.scaleId,
        response.scaleName,
        response.totalScore,
        response.completedAt,
        response.timeTaken || 0
      ].join(','))
    ].join('\n');

    res.send(csv);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to export responses'
    });
  }
});

// ========== MODULE CONTENT ADMIN ENDPOINTS ==========

// Get all module responses for admin
router.get('/module-responses', async (req, res) => {
  try {
    const { userId, moduleSlug, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (userId) query.user = userId;
    if (moduleSlug) query.moduleSlug = moduleSlug;

    const ModuleResponse = (await import('../models/ModuleResponse.js')).default;
    
    const responses = await ModuleResponse.find(query)
      .populate('user', 'name email')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ModuleResponse.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        responses,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching module responses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch module responses'
    });
  }
});

// Get all goals for admin
router.get('/goals', async (req, res) => {
  try {
    const { userId, moduleSlug, status, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (userId) query.user = userId;
    if (moduleSlug) query.moduleSlug = moduleSlug;
    if (status) query.status = status;

    const Goal = (await import('../models/Goal.js')).default;
    
    const goals = await Goal.find(query)
      .populate('user', 'name email')
      .sort({ selectedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Goal.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        goals,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch goals'
    });
  }
});

// Get all quiz responses for admin
router.get('/quiz-responses', async (req, res) => {
  try {
    const { userId, moduleSlug, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (userId) query.user = userId;
    if (moduleSlug) query.moduleSlug = moduleSlug;

    const QuizResponse = (await import('../models/QuizResponse.js')).default;
    
    const responses = await QuizResponse.find(query)
      .populate('user', 'name email')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await QuizResponse.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        responses,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching quiz responses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch quiz responses'
    });
  }
});

// Get comprehensive user course details
router.get('/user-course-details/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const ModuleResponse = (await import('../models/ModuleResponse.js')).default;
    const Goal = (await import('../models/Goal.js')).default;
    const QuizResponse = (await import('../models/QuizResponse.js')).default;
    const ModuleEnrollment = (await import('../models/ModuleEnrollment.js')).default;

    // Get all data for this user
    const [moduleResponses, goals, quizResponses, enrollments] = await Promise.all([
      ModuleResponse.find({ user: userId }).sort({ completedAt: -1 }),
      Goal.find({ user: userId }).sort({ selectedAt: -1 }),
      QuizResponse.find({ user: userId }).sort({ completedAt: -1 }),
      ModuleEnrollment.find({ user: userId }).sort({ lastAccessed: -1 })
    ]);

    // Group by module
    const moduleDetails = {};
    
    enrollments.forEach(enrollment => {
      moduleDetails[enrollment.moduleSlug] = {
        moduleName: enrollment.moduleName,
        status: enrollment.status,
        progress: enrollment.progress,
        responses: [],
        goals: [],
        quizzes: [],
        lastAccessed: enrollment.lastAccessed
      };
    });

    // Add module responses
    moduleResponses.forEach(response => {
      if (!moduleDetails[response.moduleSlug]) {
        moduleDetails[response.moduleSlug] = {
          moduleName: response.moduleName,
          responses: [],
          goals: [],
          quizzes: []
        };
      }
      moduleDetails[response.moduleSlug].responses.push({
        pageSlug: response.pageSlug,
        responseType: response.responseType,
        responses: response.responses,
        score: response.score,
        completedAt: response.completedAt
      });
    });

    // Add goals
    goals.forEach(goal => {
      if (!moduleDetails[goal.moduleSlug]) {
        moduleDetails[goal.moduleSlug] = {
          moduleName: goal.moduleName,
          responses: [],
          goals: [],
          quizzes: []
        };
      }
      moduleDetails[goal.moduleSlug].goals.push({
        goalText: goal.goalText,
        goalId: goal.goalId,
        status: goal.status,
        selectedAt: goal.selectedAt,
        completedAt: goal.completedAt
      });
    });

    // Add quiz responses
    quizResponses.forEach(quiz => {
      if (!moduleDetails[quiz.moduleSlug]) {
        moduleDetails[quiz.moduleSlug] = {
          moduleName: quiz.moduleName,
          responses: [],
          goals: [],
          quizzes: []
        };
      }
      moduleDetails[quiz.moduleSlug].quizzes.push({
        quizId: quiz.quizId,
        answers: quiz.answers,
        score: quiz.score,
        totalQuestions: quiz.totalQuestions,
        completedAt: quiz.completedAt
      });
    });

    res.json({
      status: 'success',
      data: moduleDetails
    });
  } catch (error) {
    console.error('Error fetching user course details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user course details'
    });
  }
});

// Export module responses to CSV
router.get('/export/module-responses', async (req, res) => {
  try {
    const ModuleResponse = (await import('../models/ModuleResponse.js')).default;
    
    const responses = await ModuleResponse.find()
      .populate('user', 'name email')
      .sort({ completedAt: -1 });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=module-responses.csv');

    const csv = [
      ['User Name', 'User Email', 'Module', 'Page', 'Response Type', 'Responses', 'Score', 'Completed At'].join(','),
      ...responses.map(response => [
        response.user?.name || 'Unknown',
        response.user?.email || 'Unknown',
        response.moduleSlug,
        response.pageSlug,
        response.responseType,
        JSON.stringify(response.responses).replace(/,/g, ';'),
        response.score || 'N/A',
        response.completedAt
      ].join(','))
    ].join('\n');

    res.send(csv);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to export module responses'
    });
  }
});

// Export goals to CSV
router.get('/export/goals', async (req, res) => {
  try {
    const Goal = (await import('../models/Goal.js')).default;
    
    const goals = await Goal.find()
      .populate('user', 'name email')
      .sort({ selectedAt: -1 });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=goals.csv');

    const csv = [
      ['User Name', 'User Email', 'Module', 'Goal Text', 'Status', 'Selected At', 'Completed At'].join(','),
      ...goals.map(goal => [
        goal.user?.name || 'Unknown',
        goal.user?.email || 'Unknown',
        goal.moduleSlug,
        goal.goalText,
        goal.status,
        goal.selectedAt,
        goal.completedAt || 'Not completed'
      ].join(','))
    ].join('\n');

    res.send(csv);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to export goals'
    });
  }
});

// Export quiz responses to CSV
router.get('/export/quiz-responses', async (req, res) => {
  try {
    const QuizResponse = (await import('../models/QuizResponse.js')).default;
    
    const responses = await QuizResponse.find()
      .populate('user', 'name email')
      .sort({ completedAt: -1 });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=quiz-responses.csv');

    const csv = [
      ['User Name', 'User Email', 'Module', 'Quiz ID', 'Answers', 'Score', 'Total Questions', 'Completed At'].join(','),
      ...responses.map(response => [
        response.user?.name || 'Unknown',
        response.user?.email || 'Unknown',
        response.moduleSlug,
        response.quizId,
        JSON.stringify(response.answers).replace(/,/g, ';'),
        response.score || 'N/A',
        response.totalQuestions,
        response.completedAt
      ].join(','))
    ].join('\n');

    res.send(csv);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to export quiz responses'
    });
  }
});

export default router;

import express from 'express';
import User from '../models/User.js';
import ScaleResponse from '../models/ScaleResponse.js';
import Course from '../models/Course.js';
import CourseProgress from '../models/CourseProgress.js';
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

    // Hash new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password reset successfully'
    });
  } catch (error) {
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

    // Course recommendations based on scores
    const recommendations = generateCourseRecommendations(scaleResponses);

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
          createdAt: user.createdAt
        },
        performance: {
          totalScore,
          averageScore,
          completionCount,
          lastCompletion,
          recommendations,
          riskLevel: getRiskLevel(averageScore)
        },
        scaleResponses,
        moduleEnrollments
      }
    });
  } catch (error) {
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
        response.user._id.toString() === user._id.toString()
      );
      
      const userEnrollments = moduleEnrollments.filter(enrollment => 
        enrollment.user._id.toString() === user._id.toString()
      );

      const totalScore = userScaleResponses.reduce((sum, response) => sum + response.totalScore, 0);
      const averageScore = userScaleResponses.length > 0 ? totalScore / userScaleResponses.length : 0;
      const completionCount = userScaleResponses.length;
      const lastCompletion = userScaleResponses.length > 0 ? userScaleResponses[0].completedAt : null;

      // Course recommendations based on scores
      const recommendations = generateCourseRecommendations(userScaleResponses);

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

// Helper function to determine risk level
function getRiskLevel(averageScore) {
  if (averageScore <= 15) return 'Low Risk';
  if (averageScore <= 25) return 'Moderate Risk';
  return 'High Risk';
}

// Helper function to generate course recommendations
async function generateCourseRecommendations(scaleResponses) {
  const recommendations = [];
  const averageScore = scaleResponses.length > 0 
    ? scaleResponses.reduce((sum, r) => sum + r.totalScore, 0) / scaleResponses.length 
    : 0;

  try {
    // Find courses that match the user's score range
    const courses = await Course.find({
      targetScoreRange: {
        $gte: Math.floor(averageScore - 5),
        $lte: Math.ceil(averageScore + 5)
      },
      isActive: true
    }).sort({ priority: 1, difficulty: 1 });

    return courses.map((course, index) => ({
      id: course._id,
      title: course.title,
      priority: course.priority,
      description: course.description,
      estimatedDuration: course.estimatedDuration,
      status: getCourseStatus(scaleResponses, averageScore),
      difficulty: course.difficulty,
      category: course.category
    }));
  } catch (error) {
    console.error('Error generating course recommendations:', error);
    // Fallback to hardcoded recommendations if database fails
    if (averageScore <= 15) {
      recommendations.push(
        'Basic Parenting Skills',
        'Positive Discipline Techniques',
        'Communication Building',
        'Stress Management Basics'
      );
    } else if (averageScore <= 25) {
      recommendations.push(
        'Advanced Communication',
        'Behavioral Management',
        'Emotional Support Strategies',
        'Conflict Resolution Skills'
      );
    } else {
      recommendations.push(
        'Professional Counseling Resources',
        'Crisis Intervention Training',
        'Specialized Support Services',
        'Mental Health Professional Consultation'
      );
    }

    return recommendations.map((course, index) => ({
      id: index + 1,
      title: course,
      priority: averageScore <= 15 ? 'Low' : averageScore <= 25 ? 'Medium' : 'High',
      description: getCourseDescription(course),
      estimatedDuration: getCourseDuration(course),
      status: getCourseStatus(scaleResponses, averageScore)
    }));
  }
}

// Helper function to get course description
function getCourseDescription(course) {
  const descriptions = {
    'Basic Parenting Skills': 'Fundamental parenting techniques for everyday situations',
    'Positive Discipline Techniques': 'Constructive discipline methods that promote good behavior',
    'Communication Building': 'Improving parent-child communication and understanding',
    'Stress Management Basics': 'Basic stress management and coping strategies',
    'Advanced Communication': 'Enhanced communication strategies for challenging situations',
    'Behavioral Management': 'Advanced techniques for managing difficult behaviors',
    'Emotional Support Strategies': 'Supporting emotional development and regulation',
    'Conflict Resolution Skills': 'Resolving conflicts constructively and peacefully',
    'Professional Counseling Resources': 'Access to professional counseling and support services',
    'Crisis Intervention Training': 'Training for handling crisis situations effectively',
    'Specialized Support Services': 'Specialized services for specific parenting challenges',
    'Mental Health Professional Consultation': 'Professional mental health support and guidance'
  };
  return descriptions[course] || 'Comprehensive parenting support course';
}

// Helper function to get course duration
function getCourseDuration(course) {
  const durations = {
    'Basic Parenting Skills': '4 weeks',
    'Positive Discipline Techniques': '6 weeks',
    'Communication Building': '4 weeks',
    'Stress Management Basics': '3 weeks',
    'Advanced Communication': '8 weeks',
    'Behavioral Management': '10 weeks',
    'Emotional Support Strategies': '6 weeks',
    'Conflict Resolution Skills': '5 weeks',
    'Professional Counseling Resources': 'Ongoing',
    'Crisis Intervention Training': '2 weeks',
    'Specialized Support Services': 'Variable',
    'Mental Health Professional Consultation': 'As needed'
  };
  return durations[course] || '6 weeks';
}

// Helper function to get course status
function getCourseStatus(scaleResponses, averageScore) {
  if (scaleResponses.length === 0) return 'Not Started';
  if (averageScore <= 15) return 'Recommended';
  if (averageScore <= 25) return 'Optional';
  return 'Strongly Recommended';
}

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
      .select('name email role createdAt lastLogin')
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

    const progress = await ModuleProgress.find(query)
      .populate('user', 'name email')
      .sort({ lastAccessed: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ModuleProgress.countDocuments(query);

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
    
    console.log('📚 Module enrollments request:', { page, limit, moduleSlug, userId, status });
    
    let query = {};
    if (moduleSlug) query.moduleSlug = moduleSlug;
    if (userId) query.user = userId;
    if (status) query.status = status;

    console.log('🔍 Final query:', query);

    const enrollments = await ModuleEnrollment.find(query)
      .populate('user', 'name email')
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log('📊 Found enrollments:', enrollments.length);
    enrollments.forEach(e => {
      console.log(`  - ${e.user?.name} - ${e.moduleName} - ${e.status} - ${e.progress?.percentage || 0}%`);
    });

    const total = await ModuleEnrollment.countDocuments(query);
    console.log('📈 Total count in DB:', total);

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

export default router;

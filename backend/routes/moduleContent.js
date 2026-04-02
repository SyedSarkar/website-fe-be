import express from 'express';
import ModuleResponse from '../models/ModuleResponse.js';
import Goal from '../models/Goal.js';
import QuizResponse from '../models/QuizResponse.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// ==================== MODULE RESPONSES (Checking-in Scales) ====================

// Submit a module response (checking-in scale, activity, etc.)
router.post('/response', async (req, res) => {
  try {
    const { moduleSlug, moduleName, pageSlug, responseType, responses, score } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!moduleSlug || !moduleName || !pageSlug || !responseType || !responses) {
      return res.status(400).json({
        status: 'error',
        message: 'Module slug, name, page slug, response type, and responses are required'
      });
    }

    // Create module response
    const moduleResponse = await ModuleResponse.create({
      user: userId,
      moduleSlug,
      moduleName,
      pageSlug,
      responseType,
      responses,
      score: score || null
    });

    res.status(201).json({
      status: 'success',
      message: 'Response submitted successfully',
      data: moduleResponse
    });
  } catch (error) {
    console.error('Module response error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit response'
    });
  }
});

// Get user's module responses for a specific module
router.get('/responses/:moduleSlug', async (req, res) => {
  try {
    const { moduleSlug } = req.params;
    const userId = req.user._id;

    const responses = await ModuleResponse.find({ user: userId, moduleSlug })
      .sort({ completedAt: -1 });

    res.json({
      status: 'success',
      data: responses
    });
  } catch (error) {
    console.error('Fetch responses error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch responses'
    });
  }
});

// Get specific page response
router.get('/response/:moduleSlug/:pageSlug', async (req, res) => {
  try {
    const { moduleSlug, pageSlug } = req.params;
    const userId = req.user._id;

    const response = await ModuleResponse.findOne({ 
      user: userId, 
      moduleSlug, 
      pageSlug 
    }).sort({ completedAt: -1 });

    res.json({
      status: 'success',
      data: response
    });
  } catch (error) {
    console.error('Fetch response error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch response'
    });
  }
});

// ==================== GOALS ====================

// Select a goal
router.post('/goals/select', async (req, res) => {
  try {
    const { moduleSlug, moduleName, goalText, goalId } = req.body;
    const userId = req.user._id;

    if (!moduleSlug || !moduleName || !goalText || !goalId) {
      return res.status(400).json({
        status: 'error',
        message: 'Module slug, name, goal text, and goal ID are required'
      });
    }

    // Use findOneAndUpdate with upsert to handle duplicates
    const goal = await Goal.findOneAndUpdate(
      { user: userId, moduleSlug, goalId },
      {
        moduleName,
        goalText,
        status: 'selected',
        selectedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      status: 'success',
      message: 'Goal selected successfully',
      data: goal
    });
  } catch (error) {
    console.error('Goal selection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to select goal'
    });
  }
});

// Update goal status
router.patch('/goals/:goalId/status', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (!status || !['selected', 'in_progress', 'completed', 'abandoned'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid status is required'
      });
    }

    const updateData = { status };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const goal = await Goal.findOneAndUpdate(
      { user: userId, goalId },
      updateData,
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({
        status: 'error',
        message: 'Goal not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Goal status updated',
      data: goal
    });
  } catch (error) {
    console.error('Goal update error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update goal'
    });
  }
});

// Get user's goals
router.get('/goals', async (req, res) => {
  try {
    const userId = req.user._id;
    const { moduleSlug } = req.query;

    const query = { user: userId };
    if (moduleSlug) query.moduleSlug = moduleSlug;

    const goals = await Goal.find(query)
      .sort({ selectedAt: -1 });

    res.json({
      status: 'success',
      data: goals
    });
  } catch (error) {
    console.error('Fetch goals error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch goals'
    });
  }
});

// Remove a goal
router.delete('/goals/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    const userId = req.user._id;

    await Goal.deleteOne({ user: userId, goalId });

    res.json({
      status: 'success',
      message: 'Goal removed successfully'
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove goal'
    });
  }
});

// ==================== QUIZ RESPONSES ====================

// Submit quiz response
router.post('/quiz/submit', async (req, res) => {
  try {
    const { moduleSlug, moduleName, quizId, answers, score, totalQuestions, correctAnswers, timeTaken } = req.body;
    const userId = req.user._id;

    if (!moduleSlug || !moduleName || !quizId || !answers || !totalQuestions) {
      return res.status(400).json({
        status: 'error',
        message: 'Module slug, name, quiz ID, answers, and total questions are required'
      });
    }

    const quizResponse = await QuizResponse.findOneAndUpdate(
      { user: userId, moduleSlug, quizId },
      {
        moduleName,
        answers,
        score: score || null,
        totalQuestions,
        correctAnswers: correctAnswers || null,
        timeTaken: timeTaken || 0,
        completedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      status: 'success',
      message: 'Quiz submitted successfully',
      data: quizResponse
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit quiz'
    });
  }
});

// Get quiz response for a module
router.get('/quiz/:moduleSlug/:quizId', async (req, res) => {
  try {
    const { moduleSlug, quizId } = req.params;
    const userId = req.user._id;

    const quizResponse = await QuizResponse.findOne({ 
      user: userId, 
      moduleSlug, 
      quizId 
    });

    res.json({
      status: 'success',
      data: quizResponse
    });
  } catch (error) {
    console.error('Fetch quiz error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch quiz response'
    });
  }
});

// Get all user's quiz responses
router.get('/quizzes', async (req, res) => {
  try {
    const userId = req.user._id;
    const { moduleSlug } = req.query;

    const query = { user: userId };
    if (moduleSlug) query.moduleSlug = moduleSlug;

    const quizzes = await QuizResponse.find(query)
      .sort({ completedAt: -1 });

    res.json({
      status: 'success',
      data: quizzes
    });
  } catch (error) {
    console.error('Fetch quizzes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch quizzes'
    });
  }
});

export default router;

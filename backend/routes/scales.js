import express from 'express';
import ScaleResponse from '../models/ScaleResponse.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Get user's scale responses
router.get('/my-responses', async (req, res) => {
  try {
    const userId = req.user._id;
    
    const responses = await ScaleResponse.find({ user: userId })
      .sort({ completedAt: -1 });

    res.json({
      status: 'success',
      data: responses.map(response => ({
        _id: response._id,
        scaleId: response.scaleId,
        scaleName: response.scaleName,
        totalScore: response.totalScore,
        riskLevel: response.riskLevel || 'Unknown',
        completedAt: response.completedAt,
        timeTaken: response.timeTaken || 0,
        recommendations: response.recommendations || []
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching user scale responses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch scale responses'
    });
  }
});

// Submit scale response
router.post('/submit', async (req, res, next) => {
  try {
    const { scaleId, scaleName, responses, timeTaken, notes } = req.body;

    // Validate input
    if (!scaleId || !scaleName || !responses) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide scaleId, scaleName, and responses'
      });
    }

    // Calculate total score
    const responseValues = Object.values(responses);
    const totalScore = responseValues.reduce((sum, value) => sum + value, 0);

    // Calculate risk level based on score
    let riskLevel = 'Unknown';
    if (totalScore <= 20) riskLevel = 'Low Risk';
    else if (totalScore <= 30) riskLevel = 'Medium Risk';
    else if (totalScore <= 40) riskLevel = 'High Risk';
    else riskLevel = 'Very High Risk';

    // Create scale response
    const scaleResponse = await ScaleResponse.create({
      user: req.user._id,
      scaleId,
      scaleName,
      responses,
      totalScore,
      riskLevel,
      timeTaken,
      notes
    });

    res.status(201).json({
      status: 'success',
      data: {
        scaleResponse: {
          id: scaleResponse._id,
          scaleId: scaleResponse.scaleId,
          scaleName: scaleResponse.scaleName,
          totalScore: scaleResponse.totalScore,
          completedAt: scaleResponse.completedAt
        }
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({
        status: 'fail',
        message: 'You have already completed this scale today'
      });
    }
    next(error);
  }
});

// Get user's scale responses
router.get('/my-responses', protect, async (req, res, next) => {
  try {
    const scaleResponses = await ScaleResponse.find({ user: req.user.id })
      .sort({ completedAt: -1 });

    res.status(200).json({
      status: 'success',
      results: scaleResponses.length,
      data: {
        scaleResponses
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get specific scale response
router.get('/:responseId', protect, async (req, res, next) => {
  try {
    const scaleResponse = await ScaleResponse.findOne({
      _id: req.params.responseId,
      user: req.user.id
    });

    if (!scaleResponse) {
      return res.status(404).json({
        status: 'fail',
        message: 'Scale response not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        scaleResponse
      }
    });
  } catch (error) {
    next(error);
  }
});

// Check if user has completed specific scale
router.get('/check/:scaleId', protect, async (req, res, next) => {
  try {
    const { scaleId } = req.params;
    
    const scaleResponse = await ScaleResponse.findOne({
      user: req.user.id,
      scaleId
    }).sort({ completedAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        hasCompleted: !!scaleResponse,
        lastCompleted: scaleResponse?.completedAt || null,
        totalScore: scaleResponse?.totalScore || null
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete scale response (for redoing assessment)
router.delete('/response/:scaleId', async (req, res) => {
  try {
    const { scaleId } = req.params;
    const userId = req.user._id;

    // Find and delete the scale response
    const result = await ScaleResponse.deleteOne({
      user: userId,
      scaleId: scaleId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Scale response not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Scale response deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting scale response:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete scale response'
    });
  }
});

export default router;

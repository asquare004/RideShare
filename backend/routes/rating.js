import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import Rating from '../models/Rating.js';
import { errorHandler } from '../utils/error.js';

const router = express.Router();

// Submit a rating (requires authentication)
router.post('/submit', verifyToken, async (req, res, next) => {
  try {
    const { rideId, rating, comment } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!rideId || !rating) {
      return next(errorHandler(400, 'Ride ID and rating are required'));
    }

    if (rating < 1 || rating > 5) {
      return next(errorHandler(400, 'Rating must be between 1 and 5'));
    }

    // Check if user has already rated this ride
    const existingRating = await Rating.findOne({ rideId, userId });
    if (existingRating) {
      return next(errorHandler(400, 'You have already rated this ride'));
    }

    // Create new rating
    const newRating = new Rating({
      rideId,
      userId,
      rating,
      comment: comment || ''
    });

    await newRating.save();

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      rating: newRating
    });
  } catch (error) {
    next(error);
  }
});

// Get all ratings for a ride
router.get('/ride/:rideId', async (req, res, next) => {
  try {
    const { rideId } = req.params;

    const ratings = await Rating.find({ rideId })
      .populate('userId', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      ratings
    });
  } catch (error) {
    next(error);
  }
});

// Get user's rating for a specific ride (requires authentication)
router.get('/user/:rideId', verifyToken, async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const userId = req.user._id;

    const rating = await Rating.findOne({ rideId, userId });

    res.status(200).json({
      success: true,
      rating: rating || null
    });
  } catch (error) {
    next(error);
  }
});

export default router; 
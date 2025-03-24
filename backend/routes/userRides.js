import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { 
  getUserRides,
  getUserRideById,
  cancelUserRide
} from '../controllers/userRides.js';

const router = express.Router();

// Get user rides (with various filters)
router.get('/', verifyToken, getUserRides);

// Get a single user ride by ID
router.get('/:rideId', verifyToken, getUserRideById);

// Cancel a user's booking
router.post('/:rideId/cancel', verifyToken, cancelUserRide);

export default router; 
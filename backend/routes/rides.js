import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { 
  createRide, 
  deleteRide, 
  getRides, 
  updateRide,
  joinRide,
  cancelBooking
} from '../controllers/ride.js';

const router = express.Router();

// Create a ride
router.post('/create', verifyToken, createRide);

// Get rides with filter options
router.get('/', getRides);

// Delete ride
router.delete('/:rideId', verifyToken, deleteRide);

// Update ride
router.put('/:rideId', verifyToken, updateRide);

// Join a ride (book seats)
router.post('/:rideId/join', verifyToken, joinRide);

// Cancel booking
router.post('/:rideId/cancel', verifyToken, cancelBooking);

export default router;
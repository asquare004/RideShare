import express from 'express';
import { verifyToken, verifyDriver } from '../utils/verifyUser.js';
import { 
  createRide, 
  deleteRide, 
  getRides, 
  updateRide,
  joinRide,
  cancelBooking,
  getPendingRideStatus,
  cancelPendingRide,
  acceptRideAsDriver,
  getRideById
} from '../controllers/ride.js';

const router = express.Router();

// Create a ride
router.post('/create', verifyToken, createRide);

// Get rides with filter options
router.get('/', getRides);

// Check ride status and driver acceptance
router.get('/pending-status/:rideId', getPendingRideStatus);

// Cancel a pending ride
router.put('/cancel-pending/:rideId', cancelPendingRide);

// Driver accepting a ride
router.put('/accept/:rideId', verifyDriver, acceptRideAsDriver);

// Get a single ride by ID
router.get('/:rideId', getRideById);

// Update ride
router.put('/:rideId', verifyToken, updateRide);

// Delete ride
router.delete('/:rideId', verifyToken, deleteRide);

// Join a ride as a passenger
router.post('/:rideId/join', verifyToken, joinRide);

// Cancel a booking
router.post('/:rideId/cancel', verifyToken, cancelBooking);

export default router;
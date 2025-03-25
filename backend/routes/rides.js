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
  getRideById,
  getAvailableRides,
  cancelRide,
  bookRide
} from '../controllers/ride.js';

const router = express.Router();

// Create a ride
router.post('/create', verifyToken, createRide);

// Get rides with filter options
router.get('/', getRides);

// Get available rides for the current user (excluding rides where user is a passenger)
router.get('/available', verifyToken, getAvailableRides);

// Check ride status and driver acceptance
router.get('/pending-status/:rideId', getPendingRideStatus);

// Cancel a pending ride
router.put('/cancel-pending/:rideId', cancelPendingRide);

// Driver accepting a ride
router.put('/accept/:rideId', verifyDriver, acceptRideAsDriver);

// Cancel a ride (change status to cancelled)
router.put('/cancel/:rideId', verifyToken, cancelRide);

// Get a single ride by ID
router.get('/:rideId', getRideById);

// Update ride
router.put('/:rideId', verifyToken, updateRide);

// Delete ride
router.delete('/:rideId', verifyToken, deleteRide);

// Join a ride as a passenger
router.post('/:rideId/join', verifyToken, joinRide);

// Book a ride with multiple seats
router.post('/:rideId/book', verifyToken, bookRide);

// Cancel a booking
router.post('/:rideId/cancel', verifyToken, cancelBooking);

export default router;
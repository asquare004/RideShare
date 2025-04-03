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
  bookRide,
  startRide,
  endRide
} from '../controllers/ride.js';
import Ride from '../models/Ride.js';
import { errorHandler } from '../utils/error.js';

const router = express.Router();

// Create a ride
router.post('/create', verifyToken, createRide);

// Get rides with filter options
router.get('/', getRides);

// Get available rides for the current user (excluding rides where user is a passenger)
router.get('/available', verifyToken, getAvailableRides);

// Check the status of a pending ride
router.get('/pending-status/:rideId', getPendingRideStatus);

// Cancel a pending ride
router.put('/cancel-pending/:rideId', cancelPendingRide);

// Driver accepting a ride
router.put('/accept/:rideId', verifyDriver, acceptRideAsDriver);

// Cancel a ride (change status to cancelled)
router.put('/cancel/:rideId', verifyToken, cancelRide);

// Start a ride
router.post('/:rideId/start', verifyDriver, startRide);

// End a ride
router.post('/:rideId/end', verifyDriver, endRide);

// Book a ride with multiple seats
router.post('/:rideId/book', verifyToken, bookRide);

// Get a single ride by ID
router.get('/:rideId', getRideById);

// Update ride status or details
router.put('/:rideId', verifyToken, async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    
    if (!ride) {
      return next(errorHandler(404, 'Ride not found'));
    }
    
    // If status is being updated
    if (req.body.status) {
      ride.status = req.body.status;
    }
    
    // If other fields are being updated
    if (req.body.source) ride.source = req.body.source;
    if (req.body.destination) ride.destination = req.body.destination;
    if (req.body.date) ride.date = req.body.date;
    if (req.body.departureTime) ride.departureTime = req.body.departureTime;
    if (req.body.price) ride.price = req.body.price;
    if (req.body.totalSeats) ride.totalSeats = req.body.totalSeats;
    if (req.body.leftSeats) ride.leftSeats = req.body.leftSeats;
    if (req.body.distance) ride.distance = req.body.distance;
    
    await ride.save();
    
    res.status(200).json({ success: true, ride });
  } catch (error) {
    next(error);
  }
});

// Delete ride
router.delete('/:rideId', verifyToken, deleteRide);

export default router;
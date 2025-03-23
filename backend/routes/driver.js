import express from 'express';
import { google, signin, signup, signout, getSessionInfo } from '../controllers/driverAuth.js';
import { 
  getUpcomingTrips,
  getPastTrips,
  cancelTrip,
  createRideOffering,
  getPassengerRequests,
  respondToPassengerRequest
} from '../controllers/driverTrips.js';
import { getDriverProfile, updateDriverProfile, proxyImage } from '../controllers/driverProfile.js';
import { verifyToken, verifyDriver, verifyDriverToken, checkDriverAuth } from '../utils/verifyUser.js';

const router = express.Router();

// Authentication routes
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', google);
router.post('/signout', signout);

// Profile routes (protected)
router.get('/profile/:id', verifyDriver, getDriverProfile);
router.put('/profile/:id', verifyDriver, updateDriverProfile);

// Trip-related routes
router.get('/trips/upcoming/:driverId', verifyDriver, getUpcomingTrips);
router.get('/trips/past/:driverId', verifyDriver, getPastTrips);
router.post('/trips/cancel/:tripId', verifyDriver, cancelTrip);
router.post('/trips/create', verifyDriver, createRideOffering);

// Passenger request management
router.get('/passenger-requests', verifyDriver, getPassengerRequests);
router.post('/passenger-requests/respond', verifyDriver, respondToPassengerRequest);

// Authentication check endpoint (requires authentication)
router.get('/check', verifyDriverToken, (req, res) => {
  res.status(200).json({ 
    isAuthenticated: true,
    userId: req.user.id,
    isDriver: true
  });
});

// Authentication status endpoint (does not require authentication)
router.get('/auth-status', checkDriverAuth, (req, res) => {
  if (req.isDriverAuthenticated) {
    res.status(200).json({
      isAuthenticated: true,
      userId: req.user.id,
      isDriver: true
    });
  } else {
    res.status(200).json({
      isAuthenticated: false,
      isDriver: false
    });
  }
});

// Debug endpoints for development
router.get('/debug-auth', verifyDriver, (req, res) => {
  res.status(200).json({
    user: req.user,
    driver: req.driver,
    cookies: req.cookies
  });
});

// Session info debug endpoint
router.get('/session-info', getSessionInfo);

// Image proxy endpoint (does not require authentication)
router.post('/proxy-image', proxyImage);

export default router; 
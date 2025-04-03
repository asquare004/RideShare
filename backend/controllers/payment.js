import Stripe from 'stripe';
import Ride from '../models/Ride.js';
import { errorHandler } from '../utils/error.js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Check if STRIPE_SECRET_KEY is available and provide better error handling
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('ERROR: Stripe secret key is missing! Please check your .env file.');
  // We'll initialize with a placeholder to avoid immediate crash, but functions will fail
}

const stripe = new Stripe(STRIPE_SECRET_KEY || 'placeholder_key_for_initialization');

// Create a payment intent for a ride
export const createPaymentIntent = async (req, res, next) => {
  try {
    // Verify Stripe is properly configured before proceeding
    if (!STRIPE_SECRET_KEY) {
      return next(errorHandler(500, 'Stripe API key not configured. Please contact administrator.'));
    }
    
    const { rideId } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!rideId) {
      return next(errorHandler(400, 'Ride ID is required'));
    }

    // Get ride details from database
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return next(errorHandler(404, 'Ride not found'));
    }

    // Calculate amount based on price and seats
    const seatsBooked = ride.passengers.find(
      p => p.user && p.user.toString() === userId.toString()
    )?.seats || 1;
    
    const amount = ride.price * seatsBooked;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe requires amount in cents
      currency: 'inr', // Changed to INR for Indian Rupees
      metadata: {
        rideId: rideId,
        userId: userId.toString(),
        seatsBooked: seatsBooked
      }
    });

    // Return client secret
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: amount,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    next(error);
  }
};

// Update ride status after successful payment
export const handlePaymentSuccess = async (req, res, next) => {
  try {
    // Verify Stripe is properly configured before proceeding
    if (!STRIPE_SECRET_KEY) {
      return next(errorHandler(500, 'Stripe API key not configured. Please contact administrator.'));
    }
    
    const { paymentIntentId, rideId } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!paymentIntentId || !rideId) {
      return next(errorHandler(400, 'Payment intent ID and ride ID are required'));
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return next(errorHandler(400, 'Payment has not been completed'));
    }

    // Update ride to mark payment as completed for this passenger
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return next(errorHandler(404, 'Ride not found'));
    }

    // Find passenger in the ride
    const passengerIndex = ride.passengers.findIndex(
      p => p.user && p.user.toString() === userId.toString()
    );

    if (passengerIndex === -1) {
      return next(errorHandler(400, 'User is not a passenger in this ride'));
    }

    // Update payment status
    ride.passengers[passengerIndex].paymentStatus = 'completed';
    ride.passengers[passengerIndex].paymentId = paymentIntentId;
    
    await ride.save();

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      ride
    });
  } catch (error) {
    console.error('Payment success handling error:', error);
    next(error);
  }
};

// Get payment config (publishable key)
export const getPaymentConfig = async (req, res) => {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    return res.status(500).json({
      success: false,
      message: 'Stripe publishable key not configured'
    });
  }
  
  res.status(200).json({
    publishableKey
  });
}; 
import Razorpay from 'razorpay';
import Ride from '../models/Ride.js';
import { errorHandler } from '../utils/error.js';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Ensure environment variables are loaded
dotenv.config();

// Get Razorpay keys
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Log the keys (without revealing full values)
console.log(`Initializing Razorpay with Key ID: ${RAZORPAY_KEY_ID ? RAZORPAY_KEY_ID.substring(0, 10) + '...' : 'MISSING'}`);
console.log(`Secret key exists: ${RAZORPAY_KEY_SECRET ? 'YES' : 'NO'}`);

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error('ERROR: Razorpay keys are missing! Please check your .env file.');
}

// Initialize Razorpay - make sure both key variables have values
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

// Create a payment order for a ride
export const createPaymentIntent = async (req, res, next) => {
  try {
    // Verify Razorpay is properly configured before proceeding
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return next(errorHandler(500, 'Razorpay keys not configured. Please contact administrator.'));
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

    // Create Razorpay order with shortened receipt (max 40 chars)
    // Format: receipt_[shortened rideId]_[shortened userId]
    const shortRideId = rideId.toString().substring(0, 10);
    const shortUserId = userId.toString().substring(0, 10);
    const receiptId = `rcpt_${shortRideId}_${shortUserId}`;

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: receiptId, // Shortened receipt ID
      notes: {
        rideId: rideId,
        userId: userId.toString(),
        seatsBooked: seatsBooked.toString()
      }
    };

    console.log('Creating Razorpay order with options:', options);
    
    try {
      const order = await razorpay.orders.create(options);
      console.log('Razorpay order created:', order);
      
      // Return order details
      res.status(200).json({
        success: true,
        orderId: order.id,
        amount: amount,
        currency: 'INR',
        keyId: RAZORPAY_KEY_ID
      });
    } catch (razorpayError) {
      console.error('Razorpay order creation error:', razorpayError);
      console.error('Error details:', razorpayError);
      return next(errorHandler(500, `Razorpay error: ${razorpayError.error?.description || razorpayError.message || 'Payment gateway error'}`));
    }
  } catch (error) {
    console.error('General payment error:', error);
    next(error);
  }
};

// Verify and handle payment completion
export const handlePaymentSuccess = async (req, res, next) => {
  try {
    // Verify Razorpay is properly configured
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return next(errorHandler(500, 'Razorpay keys not configured. Please contact administrator.'));
    }
    
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      rideId 
    } = req.body;
    
    const userId = req.user._id;

    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !rideId) {
      return next(errorHandler(400, 'Payment verification requires order ID, payment ID, signature, and ride ID'));
    }

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    
    if (generatedSignature !== razorpay_signature) {
      return next(errorHandler(400, 'Invalid payment signature. Payment verification failed.'));
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
    ride.passengers[passengerIndex].paymentId = razorpay_payment_id;
    
    await ride.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified and recorded successfully',
      ride
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    next(error);
  }
};

// Get payment config (key ID)
export const getPaymentConfig = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    
    if (!keyId) {
      console.error('RAZORPAY_KEY_ID is not defined in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Razorpay key ID not configured'
      });
    }
    
    console.log('Returning payment config with Razorpay key:', keyId.substring(0, 8) + '...');
    
    res.status(200).json({
      keyId,
      success: true
    });
  } catch (error) {
    console.error('Error fetching payment config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment configuration'
    });
  }
}; 
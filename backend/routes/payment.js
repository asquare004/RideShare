import express from 'express';
import { createPaymentIntent, handlePaymentSuccess } from '../controllers/payment.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// Create a payment intent
router.post('/create-payment-intent', verifyToken, createPaymentIntent);

// Handle successful payment
router.post('/payment-success', verifyToken, handlePaymentSuccess);

// Get payment config - public endpoint
router.get('/config', (req, res) => {
  console.log('Payment config endpoint called');
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    console.error('STRIPE_PUBLISHABLE_KEY is not defined in environment variables');
    return res.status(500).json({ 
      error: 'Stripe configuration is missing',
      configPresent: false
    });
  }
  
  console.log('Returning payment config with key:', process.env.STRIPE_PUBLISHABLE_KEY.substring(0, 8) + '...');
  return res.status(200).json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    configPresent: true
  });
});

export default router; 
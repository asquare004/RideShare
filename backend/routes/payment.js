import express from 'express';
import { createPaymentIntent, handlePaymentSuccess, getPaymentConfig } from '../controllers/payment.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// Create a payment intent
router.post('/create-payment-intent', verifyToken, createPaymentIntent);

// Handle payment success webhook
router.post('/payment-success', verifyToken, handlePaymentSuccess);

// Get payment config - public endpoint
router.get('/config', getPaymentConfig);

export default router; 
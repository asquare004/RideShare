import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import ridesRouter from './routes/rides.js';
import userRidesRouter from './routes/userRides.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import driverRouter from './routes/driver.js';
import ratingRouter from './routes/rating.js';
import paymentRouter from './routes/payment.js';
import path from 'path';
import cors from 'cors';
import Ride from './models/Ride.js';
import Rating from './models/Rating.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:5175'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie']
}));
app.use(express.json());
app.use(cookieParser());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/rides', ridesRouter);
app.use('/api/user-rides', userRidesRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/driver', driverRouter);
app.use('/api/ratings', ratingRouter);
app.use('/api/payments', paymentRouter);

// Debug route - add this before the 404 handler
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  
  app._router.stack.forEach(middleware => {
    if(middleware.route) {
      // Route directly attached to the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if(middleware.name === 'router') {
      // Routes attached to other routers
      middleware.handle.stack.forEach(handler => {
        if(handler.route) {
          const routePath = handler.route.path;
          const basePath = middleware.regexp.toString()
            .replace('\\^', '')
            .replace('\\/?(?=\\/|$)', '')
            .replace(/\\\//g, '/')
            .replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, ':id');
          
          routes.push({
            path: basePath + routePath,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json({ routes });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Route not found' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Check if Stripe is configured
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY) {
      console.log('Stripe is configured with secret key and publishable key');
    } else {
      console.warn('Stripe is not properly configured. Missing keys in .env file');
    }
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API is available at http://localhost:${PORT}/api`);
      console.log(`Payment API is available at http://localhost:${PORT}/api/payments`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

export default app;

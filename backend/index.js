import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import ridesRouter from './routes/rides.js';
import userRidesRouter from './routes/userRides.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import driverRouter from './routes/driver.js';
import path from 'path';
import cors from 'cors';
import Ride from './models/Ride.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true, // Allow requests from any origin
  credentials: true,
  exposedHeaders: ['set-cookie'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/rides', ridesRouter);
app.use('/api/user-rides', userRidesRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/driver', driverRouter);

// MongoDB connection with improved options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rideshare', {
  serverSelectionTimeoutMS: 15000, // Timeout for server selection
  socketTimeoutMS: 45000, // Socket timeout
  connectTimeoutMS: 30000, // Connection timeout
  heartbeatFrequencyMS: 10000, // Regular heartbeat to keep connection alive
  maxPoolSize: 10, // Maximum number of connections in the connection pool
  minPoolSize: 2, // Minimum number of connections in the connection pool
  retryWrites: true, // Retry writes if a network error happens
})
  .then(() => {
    console.log('Connected to MongoDB');
    setupScheduledTasks(); // Setup cleanup tasks after DB connection
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });

// Setup scheduled tasks for maintenance
function setupScheduledTasks() {
  // Schedule a task to run every hour to mark past rides as completed
  setInterval(async () => {
    try {
      console.log('Running scheduled task: updating past rides statuses');
      
      const currentDate = new Date();
      const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeString = currentDate.toTimeString().split(' ')[0]; // HH:MM:SS
      
      // Find scheduled/pending rides that are in the past
      const result = await Ride.updateMany(
        {
          status: { $in: ['scheduled', 'pending'] },
          $or: [
            // Past date
            { date: { $lt: dateString } },
            // Same date but past time
            { date: dateString, departureTime: { $lt: timeString } }
          ]
        },
        { $set: { status: 'completed' } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`Updated ${result.modifiedCount} past rides to 'completed' status`);
      } else {
        console.log('No past rides needed status updates');
      }
    } catch (error) {
      console.error('Error in scheduled ride status update:', error);
    }
  }, 60 * 60 * 1000); // Run every hour
}

// Set security headers (optional but recommended for Cross-Origin-Opener-Policy warnings)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Specify host and port
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

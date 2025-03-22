import Ride from '../models/Ride.js';
import { errorHandler } from '../utils/error.js';
import mongoose from 'mongoose';

export const createRide = async (req, res, next) => {
  try {
    const { 
      source, 
      sourceCord, 
      destination, 
      destinationCord, 
      leftSeats, 
      distance, 
      email, 
      date,
      departureTime,
      price,
      driverId,
      createdBy
    } = req.body;

    if (!source || !sourceCord || !destination || !destinationCord || 
        !leftSeats || !distance || !email || !date || !departureTime || !price) {
      return next(errorHandler(400, 'Please provide all required fields'));
    }

    // Validate date and time (must be in future)
    const selectedDateTime = new Date(`${date}T${departureTime}:00`);
    const currentDateTime = new Date();
    
    if (selectedDateTime <= currentDateTime) {
      return next(errorHandler(400, 'Departure date and time must be in the future'));
    }

    console.log('User from token:', req.user);
    console.log('CreatedBy from request body:', createdBy);

    const newRide = new Ride({
      source,
      sourceCord,
      destination,
      destinationCord,
      leftSeats,
      distance,
      email,
      date,
      departureTime,
      price,
      driverId: driverId || "",
      status: 'pending',
      // Use createdBy from body if present, otherwise use req.user._id
      createdBy: createdBy || (req.user ? req.user._id : undefined),
      maxSeats: leftSeats
    });

    // Set a timeout for the database operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Database operation timed out after 8 seconds'));
      }, 8000);
    });

    // Race the database operation against the timeout
    const savedRide = await Promise.race([
      newRide.save(),
      timeoutPromise
    ]);

    res.status(201).json(savedRide);
  } catch (error) {
    console.error('Error saving ride:', error);
    // Check for specific MongoDB errors
    if (error.name === 'MongooseServerSelectionError') {
      return next(errorHandler(500, 'Unable to connect to the database. Please try again later.'));
    } else if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      return next(errorHandler(500, 'Database operation timed out. Please try again later.'));
    } else if (error.message === 'Database operation timed out after 8 seconds') {
      return next(errorHandler(500, 'Request took too long to process. Please try again later.'));
    }
    next(error);
  }
};

export const getRides = async (req, res, next) => {
  try {
    const { source, destination, date, limit = 10, startIndex = 0, email } = req.query;
    
    // Get current date and time
    const today = new Date();
    
    // Base filter to only include upcoming rides
    let filter = {};
    
    // Add source, destination filters if provided
    if (source) filter.source = { $regex: source, $options: 'i' };
    if (destination) filter.destination = { $regex: destination, $options: 'i' };
    
    // If date is provided, filter by exact date
    if (date) filter.date = date;

    // If email is provided (for MyTrips), look for rides created by user OR rides with user as passenger
    if (email) {
      filter.$or = [
        { email: email }, // Rides created by user (using existing field for backward compatibility)
        { 'passengers.email': email } // Rides where user is a passenger
      ];
    }
    
    // Get all rides that match the filters
    const allRides = await Ride.find(filter);
    
    // Filter for upcoming rides by checking date and time
    const upcomingRides = allRides.filter(ride => {
      const rideDateTime = new Date(`${ride.date}T${ride.departureTime}`);
      return rideDateTime > today;
    });
    
    // Sort rides by date, time
    upcomingRides.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.departureTime}`);
      const dateTimeB = new Date(`${b.date}T${b.departureTime}`);
      return dateTimeA - dateTimeB;
    });
    
    // Apply pagination
    const paginatedRides = upcomingRides.slice(parseInt(startIndex), parseInt(startIndex) + parseInt(limit));
    
    // Get one month ago date for stats
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Count rides created in the last month
    const ridesLastMonth = allRides.filter(ride => new Date(ride.createdAt) > oneMonthAgo).length;
    
    res.status(200).json({
      success: true,
      rides: paginatedRides,
      totalUpcoming: upcomingRides.length,
      totalLastMonth: ridesLastMonth
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) {
      return next(errorHandler(404, 'Ride not found'));
    }
    
    // Check if user is the ride creator (using both createdBy and email for backward compatibility)
    if (ride.createdBy && ride.createdBy.toString() !== req.user._id.toString() && 
        ride.email !== req.user.email) {
      return next(errorHandler(403, 'You can only delete your own rides'));
    }

    await Ride.findByIdAndDelete(req.params.rideId);
    res.status(200).json('The ride has been deleted');
  } catch (error) {
    next(error);
  }
};

export const updateRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) {
      return next(errorHandler(404, 'Ride not found'));
    }

    // Check if user is the ride creator (using both createdBy and email for backward compatibility)
    if (ride.createdBy && ride.createdBy.toString() !== req.user._id.toString() && 
        ride.email !== req.user.email) {
      return next(errorHandler(403, 'You can only update your own rides'));
    }

    // If updating date/time, validate they're in the future
    if (req.body.date && req.body.departureTime) {
      const selectedDateTime = new Date(`${req.body.date}T${req.body.departureTime}:00`);
      const currentDateTime = new Date();
      
      if (selectedDateTime <= currentDateTime) {
        return next(errorHandler(400, 'Departure date and time must be in the future'));
      }
    } else if (req.body.date) {
      const selectedDateTime = new Date(`${req.body.date}T${ride.departureTime}:00`);
      const currentDateTime = new Date();
      
      if (selectedDateTime <= currentDateTime) {
        return next(errorHandler(400, 'Departure date must be in the future'));
      }
    } else if (req.body.departureTime) {
      const selectedDateTime = new Date(`${ride.date}T${req.body.departureTime}:00`);
      const currentDateTime = new Date();
      
      if (selectedDateTime <= currentDateTime) {
        return next(errorHandler(400, 'Departure time must be in the future'));
      }
    }

    const updatedRide = await Ride.findByIdAndUpdate(
      req.params.rideId,
      {
        $set: {
          source: req.body.source,
          sourceCord: req.body.sourceCord,
          destination: req.body.destination,
          destinationCord: req.body.destinationCord,
          leftSeats: req.body.leftSeats,
          distance: req.body.distance,
          status: req.body.status,
          date: req.body.date,
          departureTime: req.body.departureTime,
          price: req.body.price,
          driverId: req.body.driverId,
          maxSeats: req.body.maxSeats
        },
      },
      { new: true }
    );
    res.status(200).json(updatedRide);
  } catch (error) {
    next(error);
  }
};

// Join a ride (book seats)
export const joinRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const { bookedSeats = 1, userId } = req.body;
    
    console.log('Join ride request:', { rideId, bookedSeats, user: req.user, userId });
    
    // If req.user is not available from token, try to use the userId from request body
    let userInfo = req.user;
    
    // If no user from token but userId is provided in request body, handle manual authentication
    if (!userInfo && userId) {
      console.log('Using userId from request body as fallback:', userId);
      // Import User model at the top of the file
      const User = mongoose.model('User');
      try {
        const user = await User.findById(userId);
        if (user) {
          userInfo = { id: user._id }; 
          console.log('Found user from ID:', userInfo);
        }
      } catch (err) {
        console.error('Error finding user by ID:', err);
      }
    }
    
    // Still require authentication
    if (!userInfo) {
      return next(errorHandler(401, 'Authentication required to join a ride'));
    }
    
    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return next(errorHandler(404, 'Ride not found'));
    }
    
    console.log('Ride details:', {
      createdBy: ride.createdBy,
      email: ride.email,
      requestingUser: userInfo
    });
    
    // Check if user is trying to join their own ride - with null safety checks
    if ((ride.createdBy && userInfo.id && ride.createdBy.toString() === userInfo.id.toString()) || 
        (ride.email && req.user && req.user.email && ride.email === req.user.email)) {
      return next(errorHandler(400, 'You cannot join your own ride'));
    }
    
    // Check if user is already a passenger - with null safety checks
    const existingPassenger = ride.passengers.find(
      p => (p.userId && userInfo.id && p.userId.toString() === userInfo.id.toString()) || 
           (p.email && req.user && req.user.email && p.email === req.user.email)
    );
    
    if (existingPassenger) {
      return next(errorHandler(400, 'You have already joined this ride'));
    }
    
    // Check if there are enough available seats
    const totalBookedSeats = ride.totalBookedSeats || 0;
    const maxSeats = ride.maxSeats || 4;
    const availableSeats = maxSeats - totalBookedSeats;
    
    if (bookedSeats > availableSeats) {
      return next(errorHandler(400, `Not enough available seats. Only ${availableSeats} seats available`));
    }
    
    // Get complete user info if we only have the ID
    let userName = 'Guest';
    let userEmail = '';
    
    if (req.user && req.user.username) {
      userName = req.user.username;
      userEmail = req.user.email;
    } else if (userInfo.id) {
      try {
        const User = mongoose.model('User');
        const fullUser = await User.findById(userInfo.id);
        if (fullUser) {
          userName = fullUser.username || 'Guest';
          userEmail = fullUser.email;
        }
      } catch (err) {
        console.error('Error getting full user details:', err);
      }
    }
    
    // Add passenger to the ride
    ride.passengers.push({
      userId: userInfo.id,
      name: userName,
      email: userEmail,
      bookedSeats: parseInt(bookedSeats)
    });
    
    await ride.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully joined the ride',
      ride
    });
  } catch (error) {
    console.error('Error joining ride:', error);
    next(error);
  }
};

// Cancel booking (for passengers)
export const cancelBooking = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    
    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return next(errorHandler(404, 'Ride not found'));
    }
    
    // Find the passenger entry
    const passengerIndex = ride.passengers.findIndex(
      p => p.userId && p.userId.toString() === req.user._id.toString() || p.email === req.user.email
    );
    
    if (passengerIndex === -1) {
      return next(errorHandler(404, 'You are not a passenger on this ride'));
    }
    
    // Update passenger status to cancelled
    ride.passengers[passengerIndex].status = 'cancelled';
    
    await ride.save();
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      ride
    });
  } catch (error) {
    next(error);
  }
};
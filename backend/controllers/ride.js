import Ride from '../models/Ride.js';
import Driver from '../models/Driver.js';
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
      createdBy,
      passengers
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
    console.log('Passengers from request body:', passengers);

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
      totalSeats: 4,
      // Include passengers array if provided in request
      passengers: passengers || []
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
    const { source, destination, date, limit = 10, startIndex = 0, email, status } = req.query;
    
    // Get current date and time
    const today = new Date();
    
    // Base filter to only include upcoming rides
    let filter = {};
    
    // Filter by status if provided, otherwise only show pending rides for the main listing
    if (status) {
      filter.status = status;
    } else if (req.path === '/' && !email) {
      // If on the main ride listing and not filtering by user email,
      // only show pending rides (available for acceptance)
      filter.status = 'pending';
    }
    
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

    // console.log('Ride filter:', filter);
    
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

// Get a single ride by ID
export const getRideById = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return next(errorHandler(400, 'Invalid ride ID format'));
    }
    
    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return next(errorHandler(404, 'Ride not found'));
    }
    
    res.status(200).json(ride);
  } catch (error) {
    console.error('Error fetching ride by ID:', error);
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

// Check if a driver has accepted a pending ride
export const getPendingRideStatus = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return next(errorHandler(400, 'Invalid ride ID'));
    }
    
    const ride = await Ride.findById(rideId)
      .populate('driverId', 'firstName lastName email phoneNumber vehicleModel vehicleYear licensePlate profilePicture rating totalTrips');
      
    if (!ride) {
      return next(errorHandler(404, 'Ride not found'));
    }
    
    // Check if the ride is still in pending status
    if (ride.status === 'pending') {
      return res.status(200).json({ 
        status: 'pending',
        message: 'Still looking for a driver' 
      });
    }
    
    // Check if ride has been accepted by a driver
    if (ride.status === 'scheduled' && ride.driverId) {
      return res.status(200).json({
        status: 'accepted',
        message: 'A driver has accepted your ride',
        driver: ride.driverId,
        ride: {
          _id: ride._id,
          source: ride.source,
          destination: ride.destination,
          date: ride.date,
          departureTime: ride.departureTime,
          price: ride.price,
          distance: ride.distance,
          leftSeats: ride.leftSeats
        }
      });
    }
    
    // Handle canceled or other status
    return res.status(200).json({
      status: ride.status,
      message: `Ride is ${ride.status}`
    });
    
  } catch (error) {
    next(error);
  }
};

// Cancel a pending ride that has not been accepted by any driver
export const cancelPendingRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return next(errorHandler(400, 'Invalid ride ID'));
    }
    
    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return next(errorHandler(404, 'Ride not found'));
    }
    
    // Only pending rides can be canceled this way
    if (ride.status !== 'pending') {
      return next(errorHandler(400, 'Only pending rides can be canceled with this operation'));
    }
    
    // Update ride status to cancelled
    ride.status = 'cancelled';
    await ride.save();
    
    res.status(200).json({
      status: 'cancelled',
      message: 'Ride has been cancelled successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

// Accept a ride as a driver
export const acceptRideAsDriver = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return next(errorHandler(400, 'Invalid ride ID'));
    }
    
    // Get the driver's ID from the verified token
    // The verifyDriver middleware sets req.driver, but also keeps req.user for backward compatibility
    const driverId = req.driver ? req.driver.id : req.user._id;
    
    console.log('Driver accepting ride:', { rideId, driverId, user: req.user, driver: req.driver });
    
    // Find the driver to ensure they exist and are authorized
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return next(errorHandler(404, 'Driver account not found'));
    }
    
    // Find the ride
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return next(errorHandler(404, 'Ride not found'));
    }
    
    console.log('Found ride before update:', {
      id: ride._id,
      status: ride.status,
      driverId: ride.driverId,
      driver: ride.driver
    });
    
    // Check if the ride is still pending
    if (ride.status !== 'pending') {
      return next(errorHandler(400, 'This ride is no longer available for acceptance'));
    }
    
    // Update the ride with driver info and change status
    ride.driverId = driverId;
    ride.driver = driverId; // Set both fields for backward compatibility
    ride.status = 'scheduled';
    
    await ride.save();
    
    console.log('Updated ride after save:', {
      id: ride._id,
      status: ride.status,
      driverId: ride.driverId
    });
    
    res.status(200).json({
      status: 'accepted',
      message: 'You have successfully accepted this ride',
      ride: {
        _id: ride._id,
        source: ride.source,
        destination: ride.destination,
        date: ride.date,
        departureTime: ride.departureTime,
        price: ride.price,
        distance: ride.distance,
        leftSeats: ride.leftSeats
      }
    });
  } catch (error) {
    console.error('Error in acceptRideAsDriver:', error);
    
    if (error.name === 'CastError') {
      return next(errorHandler(400, 'Invalid ID format'));
    } else if (error.name === 'ValidationError') {
      return next(errorHandler(400, 'Validation failed: ' + error.message));
    } else if (error.code === 11000) {
      return next(errorHandler(400, 'Duplicate key error'));
    }
    
    next(error);
  }
};

export const getAvailableRides = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const userEmail = req.user ? req.user.email : null;
    
    // Build query to find rides with available seats
    const query = {
      leftSeats: { $gt: 0 },       // Only rides with seats available
      status: 'scheduled',         // Only scheduled rides
      date: { $gte: new Date().toISOString().split('T')[0] } // Only future rides
    };
    
    // Apply additional filters from request if present
    if (req.query.source) {
      query.source = { $regex: req.query.source, $options: 'i' };
    }
    
    if (req.query.destination) {
      query.destination = { $regex: req.query.destination, $options: 'i' };
    }
    
    if (req.query.date) {
      query.date = req.query.date;
    }
    
    // Find rides with the query
    let rides = await Ride.find(query)
      .populate('driverId', 'firstName lastName profilePicture rating')
      .sort({ date: 1, departureTime: 1 })
      .lean();
    
    if (!rides) {
      console.log('No rides found matching query:', query);
      return res.status(200).json({
        success: true,
        rides: [],
        totalRides: 0,
        message: 'No rides found matching your criteria.'
      });
    }
    
    console.log(`Found ${rides.length} rides before filtering for user ${userId || 'anonymous'}`);
    
    // Filter out rides created by current user
    if (userId) {
      rides = rides.filter(ride => {
        // Check if user is the creator/driver
        if (ride.driverId && typeof ride.driverId === 'object' && ride.driverId._id && 
            ride.driverId._id.toString() === userId.toString()) {
          return false;
        }
        if (ride.createdBy && ride.createdBy.toString() === userId.toString()) {
          return false;
        }
        
        // Check if user is already a passenger
        if (ride.passengers && ride.passengers.length > 0) {
          return !ride.passengers.some(passenger => 
            (passenger.user && passenger.user.toString() === userId.toString()) ||
            (passenger.email && passenger.email === userEmail)
          );
        }
        
        return true;
      });
      
      console.log(`${rides.length} rides available after filtering for user ${userId}`);
    }
    
    // Format rides response
    const formattedRides = rides.map(ride => ({
      ...ride,
      driverName: ride.driverId && typeof ride.driverId === 'object' ? 
        `${ride.driverId.firstName || ''} ${ride.driverId.lastName || ''}`.trim() || 'Driver' : 'Driver',
      driverRating: ride.driverId && typeof ride.driverId === 'object' ? ride.driverId.rating : null,
      driverProfilePicture: ride.driverId && typeof ride.driverId === 'object' ? ride.driverId.profilePicture : null
    }));
    
    res.status(200).json({
      success: true,
      rides: formattedRides,
      totalRides: formattedRides.length
    });
  } catch (error) {
    console.error('Error in getAvailableRides:', error);
    if (error.name === 'CastError') {
      return next(errorHandler(400, 'Invalid ID format in request'));
    } else if (error.kind === 'ObjectId') {
      return next(errorHandler(400, 'Invalid ride ID format'));
    }
    next(error);
  }
};

export const cancelRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return next(errorHandler(400, 'Invalid ride ID format'));
    }
    
    // Find the ride
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return next(errorHandler(404, 'Ride not found'));
    }
    
    // Check if the user has permission to cancel this ride
    // User must be either the creator or a passenger
    const userId = req.user._id.toString();
    const isCreator = ride.createdBy && ride.createdBy.toString() === userId;
    const isPassenger = ride.passengers && ride.passengers.some(p => 
      (p.user && p.user.toString() === userId) || 
      (p.email === req.user.email)
    );
    
    if (!isCreator && !isPassenger) {
      return next(errorHandler(403, 'You do not have permission to cancel this ride'));
    }
    
    // Check if the ride can be cancelled (only scheduled or pending rides can be cancelled)
    if (ride.status !== 'scheduled' && ride.status !== 'pending') {
      return next(errorHandler(400, `Cannot cancel a ride with status: ${ride.status}`));
    }
    
    // Update the ride status to cancelled
    ride.status = 'cancelled';
    await ride.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Ride has been cancelled successfully'
    });
    
  } catch (error) {
    console.error('Error cancelling ride:', error);
    next(error);
  }
};

// Book a ride with multiple seats
export const bookRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const { bookedSeats = 1 } = req.body;
    
    console.log(`Booking ride ${rideId} with ${bookedSeats} seats for user:`, req.user);
    
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return next(errorHandler(400, 'Invalid ride ID format'));
    }
    
    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return next(errorHandler(404, 'Ride not found'));
    }
    
    // Check ride status
    if (ride.status !== 'scheduled') {
      return next(errorHandler(400, `Cannot book a ride with status '${ride.status}'. Only scheduled rides can be booked.`));
    }
    
    // Check if user is trying to book their own ride
    if (
      (ride.createdBy && req.user._id && ride.createdBy.toString() === req.user._id.toString()) || 
      (ride.email && req.user.email && ride.email === req.user.email)
    ) {
      return next(errorHandler(400, 'You cannot book your own ride'));
    }
    
    // Check if user is already a passenger
    const isAlreadyPassenger = ride.passengers.some(
      passenger => 
        (passenger.user && passenger.user.toString() === req.user._id.toString()) || 
        (passenger.email && passenger.email === req.user.email)
    );
    
    if (isAlreadyPassenger) {
      return next(errorHandler(400, 'You have already booked this ride'));
    }
    
    // Validate there are enough seats available
    if (bookedSeats > ride.leftSeats) {
      return next(errorHandler(400, `Cannot book ${bookedSeats} seats. Only ${ride.leftSeats} seats are available.`));
    }
    
    // Add user as passenger
    ride.passengers.push({
      user: req.user._id,
      seats: parseInt(bookedSeats, 10),
      status: 'confirmed',
      email: req.user.email,
      name: req.user.username || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Guest'
    });
    
    // Update leftSeats
    ride.leftSeats = Math.max(0, ride.leftSeats - parseInt(bookedSeats, 10));
    
    console.log('Updated ride:', {
      leftSeats: ride.leftSeats,
      passengers: ride.passengers.length
    });
    
    // Save the updated ride
    await ride.save();
    
    res.status(200).json({
      success: true,
      message: `Successfully booked ${bookedSeats} seat(s) for the ride`,
      ride: {
        _id: ride._id,
        source: ride.source,
        destination: ride.destination,
        date: ride.date,
        departureTime: ride.departureTime,
        price: ride.price,
        leftSeats: ride.leftSeats,
        status: ride.status
      }
    });
  } catch (error) {
    console.error('Error booking ride:', error);
    if (error.name === 'CastError') {
      return next(errorHandler(400, 'Invalid data format'));
    }
    next(error);
  }
};
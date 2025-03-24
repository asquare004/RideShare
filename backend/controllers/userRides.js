import Ride from '../models/Ride.js';
import mongoose from 'mongoose';
import { errorHandler } from '../utils/error.js';

// Get user rides with filter options
export const getUserRides = async (req, res, next) => {
  try {
    const { 
      status, 
      limit = 10, 
      startIndex = 0 
    } = req.query;
    
    // Get current date and time
    const today = new Date();
    
    // Initialize filters
    let filter = {};
    
    // Add status filter if provided
    if (status) {
      filter.status = status;
    }
    
    // Handle user-specific filters
    if (!req.user || !req.user._id) {
      return next(errorHandler(401, 'Authentication required to access user rides'));
    }

    // Convert user ID to ObjectId for comparison
    const userId = new mongoose.Types.ObjectId(req.user._id);
    
    console.log('Looking for rides for user:', userId);
    
    // Find rides where user is a passenger
    filter['passengers.user'] = userId;
    
    console.log('User rides filter:', JSON.stringify(filter, null, 2));
    
    // Get all rides that match the filters
    const allRides = await Ride.find(filter)
      .populate('driverId', 'firstName lastName email phoneNumber vehicleModel vehicleYear licensePlate profilePicture rating totalTrips')
      .populate('passengers.user', 'firstName lastName email profilePicture')
      .lean(); // Convert to plain JavaScript objects
    
    console.log('Found rides:', allRides.length);
    
    // Filter and format rides
    const rides = allRides.map(ride => {
      // Add driver info
      if (ride.driverId) {
        ride.driverInfo = {
          firstName: ride.driverId.firstName,
          lastName: ride.driverId.lastName,
          profilePicture: ride.driverId.profilePicture,
          rating: ride.driverId.rating,
          vehicleModel: ride.driverId.vehicleModel,
          vehicleYear: ride.driverId.vehicleYear,
          licensePlate: ride.driverId.licensePlate
        };
      }
      
      // Find user's booking details
      const userBooking = ride.passengers?.find(p => p.user && p.user._id.toString() === userId.toString());
      
      ride.userRole = {
        isDriver: false, // Since we're only looking for passenger rides
        isPassenger: true,
        bookedSeats: userBooking ? userBooking.seats : 0
      };
      
      return ride;
    });
    
    // Sort rides by date and time
    rides.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.departureTime}`);
      const dateTimeB = new Date(`${b.date}T${b.departureTime}`);
      return dateTimeA - dateTimeB;
    });
    
    // Apply pagination
    const paginatedRides = rides.slice(parseInt(startIndex), parseInt(startIndex) + parseInt(limit));
    
    res.status(200).json({
      success: true,
      rides: paginatedRides,
      totalRides: rides.length
    });
  } catch (error) {
    console.error('Error in getUserRides:', error);
    if (error instanceof mongoose.Error) {
      return next(errorHandler(500, 'Database error: ' + error.message));
    }
    next(error);
  }
};

// Get a single user ride by ID with extended details
export const getUserRideById = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return next(errorHandler(400, 'Invalid ride ID format'));
    }
    
    const ride = await Ride.findById(rideId)
      .populate('driverId', 'firstName lastName email phoneNumber vehicleModel vehicleYear licensePlate profilePicture rating totalTrips');
    
    if (!ride) {
      return next(errorHandler(404, 'Ride not found'));
    }
    
    // Check if the user is authorized to view this ride
    // (either created by them or they are a passenger)
    const isCreator = ride.createdBy && 
                     req.user._id.toString() === ride.createdBy.toString();
    
    const isPassenger = ride.passengers && 
                       ride.passengers.some(p => 
                         p.userId && p.userId.toString() === req.user._id.toString());
    
    if (!isCreator && !isPassenger) {
      return next(errorHandler(403, 'You are not authorized to view this ride'));
    }
    
    // Convert to plain object and add driver info
    const rideObject = ride.toObject();
    
    // If the ride has a driver, add the driver info under a separate field
    if (ride.driverId && typeof ride.driverId === 'object') {
      rideObject.driverInfo = {
        firstName: ride.driverId.firstName,
        lastName: ride.driverId.lastName,
        profilePicture: ride.driverId.profilePicture,
        rating: ride.driverId.rating,
        vehicleModel: ride.driverId.vehicleModel,
        vehicleYear: ride.driverId.vehicleYear,
        licensePlate: ride.driverId.licensePlate
      };
    }
    
    // Add user relationship to the ride
    rideObject.userRelationship = {
      isCreator,
      isPassenger
    };
    
    res.status(200).json(rideObject);
  } catch (error) {
    console.error('Error fetching user ride by ID:', error);
    next(error);
  }
};

// Cancel a user's booking on a ride
export const cancelUserRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return next(errorHandler(400, 'Invalid ride ID format'));
    }
    
    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return next(errorHandler(404, 'Ride not found'));
    }
    
    // Check if the user is a passenger on this ride
    const passengerIndex = ride.passengers.findIndex(
      p => p.userId && p.userId.toString() === req.user._id.toString()
    );
    
    if (passengerIndex === -1) {
      return next(errorHandler(403, 'You are not a passenger on this ride'));
    }
    
    // Update passenger status to cancelled
    ride.passengers[passengerIndex].status = 'cancelled';
    
    await ride.save();
    
    res.status(200).json({
      success: true,
      message: 'Your booking has been cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling user ride:', error);
    next(error);
  }
}; 
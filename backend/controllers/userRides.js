import Ride from '../models/Ride.js';
import mongoose from 'mongoose';
import { errorHandler } from '../utils/error.js';

// Get user rides with filter options
export const getUserRides = async (req, res, next) => {
  try {
    const { 
      status, 
      limit = 200, // Increased limit further to ensure we get all rides
      startIndex = 0 
    } = req.query;
    
    // Get current date and time
    const today = new Date();
    
    // Handle user-specific filters
    if (!req.user || !req.user._id) {
      return next(errorHandler(401, 'Authentication required to access user rides'));
    }

    // Convert user ID to ObjectId for comparison
    const userId = new mongoose.Types.ObjectId(req.user._id);
    
    console.log('Looking for rides for user:', userId);
    
    // Initialize filters - first create a filter that will catch ALL possible places a user ID could be
    let filter = {
      $or: [
        // User is a passenger - try multiple ways to match passenger
        { 'passengers.user': userId },                    // Direct ObjectId match
        { 'passengers.user': userId.toString() },         // String match
        { 'passengers.userId': userId },                  // Alternative field name
        { 'passengers.userId': userId.toString() },       // Alternative field as string
        { 'passengers.email': req.user.email },           // Email match (backup)

        // User is driver using different possible field names
        { driverId: userId },                             // As driver ID
        { driverId: userId.toString() },                  // As string
        { driver: userId },                               // Alternative field
        { driver: userId.toString() },                    // Alternative as string
        
        // User is creator
        { creatorId: userId },                            // As creator ID
        { creatorId: userId.toString() },                 // As string
        { createdBy: userId },                            // Alternative field
        { createdBy: userId.toString() },                 // Alternative as string
        { creator: userId },                              // Another alternative
        { creator: userId.toString() }                    // Another alternative as string
      ]
    };
    
    // Add status filter if provided
    if (status) {
      filter.status = status;
    }
    
    console.log('User rides filter:', JSON.stringify(filter, null, 2));
    
    // Get all rides that match the filters, with full population
    const allRides = await Ride.find(filter)
      .populate({
        path: 'driverId',
        select: 'firstName lastName email phoneNumber vehicleModel vehicleYear licensePlate profilePicture rating totalTrips'
      })
      .populate({
        path: 'passengers.user',
        select: 'firstName lastName email profilePicture'
      })
      .lean(); // Convert to plain JavaScript objects
    
    console.log('Found rides:', allRides.length);
    
    // Double check if we got all rides by running a separate query with just email
    const emailRides = await Ride.find({ 'passengers.email': req.user.email }).lean();
    console.log('Additional rides found by email:', emailRides.length);
    
    // Combine both result sets and remove duplicates
    let combinedRides = [...allRides];
    emailRides.forEach(emailRide => {
      if (!combinedRides.some(ride => ride._id.toString() === emailRide._id.toString())) {
        combinedRides.push(emailRide);
      }
    });
    
    console.log('Total combined rides:', combinedRides.length);
    
    // Filter and format rides
    const rides = combinedRides.map(ride => {
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
      
      // Find user's booking details - try multiple passenger fields
      const userBooking = ride.passengers?.find(p => {
        if (!p) return false;
        
        // Try multiple ways to match the passenger to current user
        return (p.user && p.user._id && p.user._id.toString() === userId.toString()) ||
               (p.user && p.user === userId.toString()) ||
               (p.userId && p.userId.toString() === userId.toString()) ||
               (p.email && p.email === req.user.email);
      });
      
      // Determine user's role in this ride - check all possible fields
      const isDriver = 
        (ride.driverId && ride.driverId._id && ride.driverId._id.toString() === userId.toString()) ||
        (ride.driverId && ride.driverId === userId.toString()) ||
        (ride.driver && ride.driver._id && ride.driver._id.toString() === userId.toString()) ||
        (ride.driver && ride.driver === userId.toString()) ||
        (ride.creatorId && ride.creatorId.toString() === userId.toString()) ||
        (ride.createdBy && ride.createdBy.toString() === userId.toString()) ||
        (ride.creator && ride.creator._id && ride.creator._id.toString() === userId.toString()) ||
        (ride.creator && ride.creator === userId.toString());

      const isPassenger = !!userBooking;
      
      // Only include rides where user has a clear role
      if (!isDriver && !isPassenger) {
        console.log(`Ride ${ride._id} does not have a clear role for user ${userId}`);
        // return null; // We'll include all rides for now to debug
      }
      
      ride.userRole = {
        isDriver: isDriver,
        isPassenger: isPassenger,
        bookedSeats: userBooking ? userBooking.seats : 0
      };
      
      return ride;
    }).filter(Boolean); // Remove null entries if we decide to exclude some rides
    
    // Sort rides by date and time
    rides.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.departureTime || '00:00'}`);
      const dateTimeB = new Date(`${b.date}T${b.departureTime || '00:00'}`);
      return dateTimeA - dateTimeB;
    });
    
    // Apply pagination with higher limit
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
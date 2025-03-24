import Driver from '../models/Driver.js';
import Ride from '../models/Ride.js';
import { errorHandler } from '../utils/error.js';

// Get upcoming trips for the current driver (authenticated user)
export const getDriverUpcomingTrips = async (req, res, next) => {
  try {
    const driverId = req.driver.id;
    console.log('Getting upcoming trips for driver ID:', driverId);

    const currentDate = new Date();
    console.log('Current date for filtering:', currentDate.toISOString());
    
    // Check for rides with either driver or driverId field
    const allDriverRides = await Ride.find({
      $or: [
        { driverId: driverId },
        { driver: driverId }
      ]
    });
    
    console.log('All rides for this driver:', allDriverRides.length, allDriverRides.map(r => ({
      id: r._id,
      status: r.status,
      driverId: r.driverId,
      driver: r.driver,
      date: r.date,
      departureTime: r.departureTime
    })));
    
    const upcomingRides = await Ride.find({
      $or: [
        { driverId: driverId },
        { driver: driverId }
      ],
      status: 'scheduled',
      $or: [
        { date: { $gt: currentDate.toISOString().split('T')[0] } },
        { 
          date: currentDate.toISOString().split('T')[0],
          departureTime: { $gte: currentDate.toTimeString().substring(0, 5) }
        }
      ]
    }).sort({ date: 1, departureTime: 1 });
    
    console.log(`Found ${upcomingRides.length} upcoming trips for driver:`, upcomingRides);
    res.status(200).json(upcomingRides);
  } catch (error) {
    console.error('Error getting upcoming trips:', error);
    next(error);
  }
};

// Get past trips for the current driver (authenticated user)
export const getDriverPastTrips = async (req, res, next) => {
  try {
    const driverId = req.driver.id;
    console.log('Getting past trips for driver ID:', driverId);

    const currentDate = new Date();
    
    const pastRides = await Ride.find({
      $or: [
        { driverId: driverId },
        { driver: driverId }
      ],
      $or: [
        { 
          date: { $lt: currentDate.toISOString().split('T')[0] } 
        },
        { 
          date: currentDate.toISOString().split('T')[0],
          departureTime: { $lt: currentDate.toTimeString().substring(0, 5) }
        },
        {
          status: 'completed'
        }
      ]
    }).sort({ date: -1, departureTime: -1 });
    
    console.log(`Found ${pastRides.length} past trips for driver:`, pastRides);
    res.status(200).json(pastRides);
  } catch (error) {
    console.error('Error getting past trips:', error);
    next(error);
  }
};

// Get upcoming trips for a driver
export const getUpcomingTrips = async (req, res, next) => {
  try {
    if (req.driver.id !== req.params.driverId) {
      return next(errorHandler(403, 'You can only view your own trips'));
    }

    const currentDate = new Date();
    
    const upcomingRides = await Ride.find({
      driverId: req.params.driverId,
      date: { $gte: currentDate.toISOString().split('T')[0] },
      status: { $in: ['scheduled', 'pending'] }
    }).sort({ date: 1, departureTime: 1 });
    
    res.status(200).json(upcomingRides);
  } catch (error) {
    next(error);
  }
};

// Get past trips for a driver
export const getPastTrips = async (req, res, next) => {
  try {
    if (req.driver.id !== req.params.driverId) {
      return next(errorHandler(403, 'You can only view your own trips'));
    }

    const currentDate = new Date();
    
    const pastRides = await Ride.find({
      driverId: req.params.driverId,
      $or: [
        { date: { $lt: currentDate.toISOString().split('T')[0] } },
        { 
          date: currentDate.toISOString().split('T')[0],
          status: 'completed'
        }
      ]
    }).sort({ date: -1, departureTime: -1 });
    
    res.status(200).json(pastRides);
  } catch (error) {
    next(error);
  }
};

// Cancel a trip
export const cancelTrip = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.tripId);
    
    if (!ride) {
      return next(errorHandler(404, 'Ride not found'));
    }
    
    const rideDriverId = ride.driverId ? ride.driverId.toString() : (ride.driver ? ride.driver.toString() : null);
    
    if (rideDriverId !== req.driver.id) {
      return next(errorHandler(403, 'You can only cancel your own rides'));
    }
    
    if (ride.status === 'completed') {
      return next(errorHandler(400, 'Cannot cancel a completed trip'));
    }
    
    // Update the ride status to 'cancelled'
    ride.status = 'cancelled';
    await ride.save();
    
    res.status(200).json({ success: true, message: 'Trip cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

// Create a new ride offering
export const createRideOffering = async (req, res, next) => {
  try {
    const {
      source,
      destination,
      date,
      departureTime,
      price,
      seats,
      distance,
    } = req.body;
    
    // Validate required fields
    if (!source || !destination || !date || !departureTime || !price || !seats || !distance) {
      return next(errorHandler(400, 'All fields are required'));
    }
    
    // Create new ride
    const newRide = new Ride({
      driverId: req.driver.id,
      source,
      destination,
      date,
      departureTime,
      price,
      totalSeats: seats,
      leftSeats: seats,
      distance,
      status: 'scheduled',
      passengers: []
    });
    
    await newRide.save();
    
    // Update driver's total trips count
    await Driver.findByIdAndUpdate(req.driver.id, {
      $inc: { totalTrips: 1 }
    });
    
    res.status(201).json({ success: true, ride: newRide });
  } catch (error) {
    next(error);
  }
};

// Get all passenger requests for a driver's trips
export const getPassengerRequests = async (req, res, next) => {
  try {
    // Find rides where the driver is the current user and there are pending passenger requests
    const rides = await Ride.find({
      $or: [
        { driverId: req.driver.id },
        { driver: req.driver.id }
      ],
      'passengers.status': 'pending'
    }).populate('passengers.user', 'username profilePicture'); // Populate basic user info
    
    const requests = [];
    
    // Format the passenger requests
    rides.forEach(ride => {
      ride.passengers.forEach(passenger => {
        if (passenger.status === 'pending') {
          requests.push({
            rideId: ride._id,
            passengerId: passenger.user._id,
            passengerName: passenger.user.username,
            profilePicture: passenger.user.profilePicture,
            source: ride.source,
            destination: ride.destination,
            date: ride.date,
            departureTime: ride.departureTime,
            seats: passenger.seats,
            status: passenger.status,
            requestId: passenger._id
          });
        }
      });
    });
    
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

// Accept or reject a passenger request
export const respondToPassengerRequest = async (req, res, next) => {
  try {
    const { rideId, passengerId, action } = req.body;
    
    if (!rideId || !passengerId || !action) {
      return next(errorHandler(400, 'Missing required parameters'));
    }
    
    if (action !== 'accept' && action !== 'reject') {
      return next(errorHandler(400, 'Action must be either accept or reject'));
    }
    
    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return next(errorHandler(404, 'Ride not found'));
    }
    
    const rideDriverId = ride.driverId ? ride.driverId.toString() : (ride.driver ? ride.driver.toString() : null);
    
    if (rideDriverId !== req.driver.id) {
      return next(errorHandler(403, 'You can only respond to requests for your own rides'));
    }
    
    // Find passenger in the ride
    const passengerIndex = ride.passengers.findIndex(
      p => p.user.toString() === passengerId
    );
    
    if (passengerIndex === -1) {
      return next(errorHandler(404, 'Passenger request not found'));
    }
    
    const passenger = ride.passengers[passengerIndex];
    
    if (passenger.status !== 'pending') {
      return next(errorHandler(400, 'This request has already been processed'));
    }
    
    if (action === 'accept') {
      // Check if there are enough seats left
      if (ride.leftSeats < passenger.seats) {
        return next(errorHandler(400, 'Not enough seats available'));
      }
      
      // Update passenger status and available seats
      ride.passengers[passengerIndex].status = 'confirmed';
      ride.leftSeats -= passenger.seats;
    } else {
      // Reject the request
      ride.passengers[passengerIndex].status = 'rejected';
    }
    
    await ride.save();
    
    res.status(200).json({ 
      success: true, 
      message: `Passenger request ${action === 'accept' ? 'accepted' : 'rejected'} successfully`
    });
  } catch (error) {
    next(error);
  }
}; 
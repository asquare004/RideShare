import Ride from '../models/Ride.js';
import { errorHandler } from '../utils/error.js';

export const createRide = async (req, res, next) => {
  const { source, sourceCord, destination, destinationCord, leftSeats, distance, email, driverId} = req.body;

  if (!source || !sourceCord || !destination || !destinationCord || !leftSeats || !distance || !email) {
    return next(errorHandler(400, 'Please provide all required fields'));
  }

  const newRide = new Ride({
    source,
    sourceCord,
    destination,
    destinationCord,
    leftSeats,
    distance,
    email,
    status: 'pending'
  });

  try {
    const savedRide = await newRide.save();
    res.status(201).json(savedRide);
  } catch (error) {
    next(error);
  }
};

export const getRides = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;

    const rides = await Ride.find({
      ...(req.query.email && { email: req.query.email }),
      ...(req.query.status && { status: req.query.status }),
      ...(req.query.source && { source: { $regex: req.query.source, $options: 'i' } }),
      ...(req.query.destination && { destination: { $regex: req.query.destination, $options: 'i' } }),
    })
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalRides = await Ride.countDocuments();

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthRides = await Ride.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      rides,
      totalRides,
      lastMonthRides,
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
    
    if (ride.email !== req.user.email) {
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

    if (ride.email !== req.user.email) {
      return next(errorHandler(403, 'You can only update your own rides'));
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
        },
      },
      { new: true }
    );
    res.status(200).json(updatedRide);
  } catch (error) {
    next(error);
  }
};
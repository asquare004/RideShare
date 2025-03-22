import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true
  },
  sourceCord: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  destinationCord: {
    type: String,
    required: true
  },
  leftSeats: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  distance: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  email: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  driverId: {
    type: String,
  }
});

export default mongoose.model('Ride', rideSchema);

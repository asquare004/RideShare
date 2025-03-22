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
    required: true
  },
  date: {
    type: String,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  driverId: {
    type: String,
    default: ""
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  passengers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String
    },
    email: {
      type: String
    },
    bookedSeats: {
      type: Number,
      default: 1,
      min: 1
    },
    bookingDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    }
  }],
  totalBookedSeats: {
    type: Number,
    default: 0
  },
  maxSeats: {
    type: Number,
    default: 4,
    min: 1,
    max: 4
  }
});

rideSchema.virtual('availableSeats').get(function() {
  return this.maxSeats - this.totalBookedSeats;
});

rideSchema.pre('save', function(next) {
  if (this.passengers) {
    const confirmedBookings = this.passengers
      .filter(passenger => passenger.status === 'confirmed')
      .reduce((total, passenger) => total + passenger.bookedSeats, 0);
    
    this.totalBookedSeats = confirmedBookings;
    this.leftSeats = this.maxSeats - confirmedBookings;
  }
  next();
});

export default mongoose.model('Ride', rideSchema);

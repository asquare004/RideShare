import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true
  },
  sourceCord: {
    type: String,
    default: ''
  },
  destination: {
    type: String,
    required: true
  },
  destinationCord: {
    type: String,
    default: ''
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
    default: 4
  },
  leftSeats: {
    type: Number,
    required: true,
    min: 0,
    max: 4
  },
  distance: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'pending', 'completed', 'cancelled'],
    default: 'scheduled'
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
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  passengers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    seats: {
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
      enum: ['pending', 'confirmed', 'cancelled', 'rejected'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'pending'
    },
    paymentId: {
      type: String,
      default: ''
    }
  }],
  route: {
    type: {
      type: String,
      default: 'LineString'
    },
    coordinates: {
      type: Array,
      default: []
    }
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 0
  },
  actualDepartureTime: {
    type: Date
  },
  actualArrivalTime: {
    type: Date
  },
  vehicleDetails: {
    model: String,
    color: String,
    licensePlate: String
  }
});

// Virtual for available seats
rideSchema.virtual('availableSeats').get(function() {
  return this.leftSeats;
});

// Pre-save hook to calculate leftSeats and update status
rideSchema.pre('save', function(next) {
  // Calculate confirmed passengers
  if (this.passengers && this.passengers.length > 0) {
    const confirmedBookings = this.passengers
      .filter(passenger => passenger.status === 'confirmed')
      .reduce((total, passenger) => total + passenger.seats, 0);
    
    this.leftSeats = this.totalSeats - confirmedBookings;
  } else {
    this.leftSeats = this.totalSeats;
  }

  // Auto-update status to completed for past rides
  const currentDate = new Date();
  const rideDate = new Date(`${this.date}T${this.departureTime}`);
  
  // If ride date is in the past and status is still scheduled/pending, mark as completed
  if (rideDate < currentDate && ['scheduled', 'pending'].includes(this.status)) {
    this.status = 'completed';
  }
  
  next();
});

// Index for efficient querying
rideSchema.index({ driver: 1, date: 1 });
rideSchema.index({ status: 1 });
rideSchema.index({ 'passengers.user': 1 });

export default mongoose.model('Ride', rideSchema);

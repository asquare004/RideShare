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
  driverId: {
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
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'rejected'],
      default: 'pending'
    },
  }],
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
  // If this is a new ride, add the creator as a confirmed passenger
  if (this.isNew && this.createdBy) {
    // Check if creator is not already in passengers list
    const creatorExists = this.passengers.some(p => 
      (p.user && p.user.toString() === this.createdBy.toString()) ||
      (p.user && p.user === this.createdBy)
    );
    
    if (!creatorExists) {
      console.log('Adding creator as passenger:', this.createdBy);
      this.passengers.push({
        user: this.createdBy,
        seats: 1,
        status: 'confirmed'
      });
    }
  }

  // Calculate confirmed passengers
  if (this.passengers && this.passengers.length > 0) {
    console.log('Calculating confirmed bookings. Passengers:', this.passengers);
    const confirmedBookings = this.passengers
      .filter(passenger => passenger.status === 'confirmed')
      .reduce((total, passenger) => total + passenger.seats, 0);
    
    // Only update leftSeats if there are confirmed bookings
    if (confirmedBookings > 0) {
      this.leftSeats = this.totalSeats - confirmedBookings;
      console.log('Updated leftSeats:', this.leftSeats);
    }
  }

  // Auto-update status to completed for past rides
  const currentDate = new Date();
  const rideDate = new Date(`${this.date}T${this.departureTime}`);
  
  // If ride date is in the past and status is still scheduled/pending, mark as completed
  if (rideDate < currentDate && ['scheduled', 'pending'].includes(this.status)) {
    this.status = 'completed';
  }
  
  // Make sure driver field is always set to the same value as driverId
  if (this.driver && !this.driverId) {
    this.driverId = this.driver;
  } else if (this.driverId && !this.driver) {
    this.driver = this.driverId;
  }
  
  next();
});

// Index for efficient querying
rideSchema.index({ driver: 1, date: 1 });
rideSchema.index({ status: 1 });
rideSchema.index({ 'passengers.user': 1 });

export default mongoose.model('Ride', rideSchema);

import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      // required: true,
    },
    firstName: {
      type: String,
      // required: true,
    },
    lastName: {
      type: String,
      // required: true,
    },
    vehicleModel: {
      type: String,
      // required: true,
    },
    vehicleYear: {
      type: Number,
      // required: true,
    },
    licensePlate: {
      type: String,
      // required: true,
    },
    licenseNumber: {
      type: String,
      default: '',
    },
    profilePicture: {
      type: String,
      default:
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalTrips: {
      type: Number,
      default: 0,
    },
    memberSince: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

const Driver = mongoose.model('Driver', driverSchema);

export default Driver; 
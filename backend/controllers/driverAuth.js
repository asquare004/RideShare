import Driver from '../models/Driver.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
  const { 
    username, 
    email, 
    password, 
    firstName, 
    lastName, 
    phoneNumber, 
    vehicleModel, 
    vehicleYear, 
    licensePlate 
  } = req.body;

  if (
    !email ||
    !password ||
    !username ||
    !firstName ||
    !lastName ||
    !phoneNumber ||
    !vehicleModel ||
    !vehicleYear ||
    !licensePlate ||
    email === '' ||
    password === '' ||
    username === ''
  ) {
    return next(errorHandler(400, 'All fields are required'));
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  const newDriver = new Driver({
    username,
    email,
    password: hashedPassword,
    firstName,
    lastName,
    phoneNumber,
    vehicleModel,
    vehicleYear,
    licensePlate,
    memberSince: new Date()
  });

  try {
    await newDriver.save();
    res.status(201).json({ success: true, message: 'Driver account created successfully' });
  } catch (error) {
    // Check for duplicate key errors
    if (error.code === 11000) {
      // Determine which field caused the duplicate error
      const field = Object.keys(error.keyPattern)[0];
      return next(errorHandler(400, `An account with this ${field} already exists`));
    }
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === '' || password === '') {
    return next(errorHandler(400, 'Email and password are required'));
  }

  try {
    const driver = await Driver.findOne({ email });
    if (!driver) {
      return next(errorHandler(404, 'Driver not found'));
    }
    
    const validPassword = bcryptjs.compareSync(password, driver.password);
    if (!validPassword) {
      return next(errorHandler(400, 'Invalid password'));
    }
    
    const token = jwt.sign(
      { id: driver._id, role: 'driver' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: pass, ...driverData } = driver._doc;

    res
      .status(200)
      .cookie('driver_access_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      })
      .json({ 
        success: true, 
        ...driverData, 
        token 
      });
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;
  
  if (!email) {
    return next(errorHandler(400, 'Email is required from Google authentication'));
  }
  
  try {
    // First check if driver with this email exists
    const driver = await Driver.findOne({ email });
    
    if (driver) {
      // If driver exists and doesn't have a profile picture but Google has one, update it
      if (googlePhotoUrl && (!driver.profilePicture || driver.profilePicture === 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png')) {
        await Driver.findByIdAndUpdate(driver._id, {
          $set: { profilePicture: googlePhotoUrl }
        });
      }
      
      // Get updated driver data
      const updatedDriver = await Driver.findById(driver._id);
      
      // Create token
      const token = jwt.sign(
        { id: updatedDriver._id, role: 'driver' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      const { password, ...driverData } = updatedDriver._doc;
      
      // Send response
      res
        .status(200)
        .cookie('driver_access_token', token, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/'
        })
        .json({ 
          success: true, 
          ...driverData, 
          token 
        });
    } else {
      // For drivers, we need additional information which Google doesn't provide
      return res.status(400).json({
        success: false,
        message: 'No driver account exists with this email. Please sign up with full driver details.'
      });
    }
  } catch (error) {
    console.error('Google auth error:', error);
    next(error);
  }
};

export const signout = async (req, res, next) => {
  try {
    res
      .clearCookie('driver_access_token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
      })
      .status(200)
      .json({ success: true, message: 'Driver signed out successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  if (req.params.id !== req.user.id) {
    return next(errorHandler(403, 'You can only update your own profile'));
  }

  try {
    // Only allow certain fields to be updated
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      vehicleModel, 
      vehicleYear, 
      licensePlate, 
      licenseNumber 
    } = req.body;

    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          firstName,
          lastName,
          email,
          phoneNumber,
          vehicleModel,
          vehicleYear,
          licensePlate,
          licenseNumber
        }
      },
      { new: true }
    );

    const { password, ...rest } = updatedDriver._doc;

    res.status(200).json({ success: true, ...rest });
  } catch (error) {
    next(error);
  }
};

// Debug endpoint to check session information
export const getSessionInfo = async (req, res) => {
  try {
    // Only available in development
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: 'Debug endpoints are not available in production' });
    }
    
    // Return information about the current session
    res.status(200).json({
      isAuthenticated: !!req.user,
      user: req.user ? {
        id: req.user._id,
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        profilePicture: req.user.profilePicture,
        session: req.session
      } : null,
      cookies: req.cookies,
      sessionId: req.sessionID,
      headers: {
        authorization: req.headers.authorization,
        cookie: req.headers.cookie
      }
    });
  } catch (error) {
    console.error('Debug session error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 
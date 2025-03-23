import Driver from '../models/Driver.js';
import { errorHandler } from '../utils/error.js';

// Get driver profile
export const getDriverProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate if user is requesting their own profile
    if (id !== req.driver.id) {
      return next(errorHandler(403, 'You can only access your own profile'));
    }
    
    const driver = await Driver.findById(id).select('-password');
    
    if (!driver) {
      return next(errorHandler(404, 'Driver not found'));
    }
    
    res.status(200).json(driver);
  } catch (error) {
    next(error);
  }
};

// Update driver profile
export const updateDriverProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate if user is updating their own profile
    if (id !== req.driver.id) {
      return next(errorHandler(403, 'You can only update your own profile'));
    }
    
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber,
      vehicleModel,
      vehicleYear,
      licensePlate,
      licenseNumber,
      profilePicture
    } = req.body;
    
    // Create update object with only provided fields
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (vehicleModel) updateFields.vehicleModel = vehicleModel;
    if (vehicleYear) updateFields.vehicleYear = vehicleYear;
    if (licensePlate) updateFields.licensePlate = licensePlate;
    if (licenseNumber) updateFields.licenseNumber = licenseNumber;
    if (profilePicture) updateFields.profilePicture = profilePicture;
    
    // Update the driver profile
    const updatedDriver = await Driver.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).select('-password');
    
    if (!updatedDriver) {
      return next(errorHandler(404, 'Driver not found'));
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      ...updatedDriver._doc
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to proxy images
export const proxyImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'Missing image URL' });
    }
    
    // Return a proxy URL that avoids CORS issues
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}`;
    
    res.status(200).json({
      success: true,
      originalUrl: imageUrl,
      proxyUrl: proxyUrl
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).json({ message: 'Error proxying image', error: error.message });
  }
}; 
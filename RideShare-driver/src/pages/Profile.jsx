import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../redux/user/userSlice';
import { getProxiedImageUrl, getInitials, DEFAULT_PROFILE_IMAGE } from '../utils/imageUtils';

function Profile() {
  const { currentUser } = useSelector(state => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    licenseNumber: '',
    rating: 0,
    totalTrips: 0,
    memberSince: '',
    profilePicture: ''
  });
  const [isDebugMode] = useState(process.env.NODE_ENV === 'development');
  const [imageError, setImageError] = useState(false);

  const fileInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    // Debug logging only in development
    if (isDebugMode) {
      console.log('Profile component mounted');
      console.log('Current user state:', currentUser);
    }
    
    // Check authentication status
    checkAuthStatus();
    
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    
    fetchDriverProfile();
  }, [currentUser, navigate, isDebugMode]);
  
  // Function to check authentication status
  const checkAuthStatus = async () => {
    try {
      // First check the general auth status
      const res = await fetch('/api/driver/auth-status', {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (isDebugMode) {
        console.log('Auth status response:', data);
      }
      
      // Also try the debug endpoint if we're in development mode
      if (isDebugMode) {
        try {
          const debugRes = await fetch('/api/driver/debug-auth', {
            method: 'GET',
            credentials: 'include'
          });
          
          if (debugRes.ok) {
            const debugData = await debugRes.json();
            console.log('Debug auth data:', debugData);
          } else {
            console.log('Debug auth failed - you may not be authenticated');
          }
        } catch (debugErr) {
          console.error('Error checking debug auth:', debugErr);
        }
      }
      
      if (!data.isAuthenticated && !currentUser) {
        navigate('/sign-in');
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      if (!currentUser) {
        navigate('/sign-in');
      }
    }
  };

  const fetchDriverProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    // Extract driver ID from currentUser
    const driverId = currentUser?._id || currentUser?.id || currentUser?._doc?._id;
    
    if (!driverId) {
      setError("Could not find user ID. Please sign out and sign in again.");
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`/api/driver/profile/${driverId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch profile data');
      }
      
      // Start with profile picture from current user (if it exists)
      // This ensures we maintain the Google profile picture if it exists
      let profilePicture = currentUser.profilePicture || data.profilePicture || '';
      
      // Apply proxy to the image URL if needed to avoid CORS issues
      profilePicture = getProxiedImageUrl(profilePicture);
      
      if (isDebugMode && profilePicture) {
        console.log('Using profile picture:', profilePicture);
      }
      
      setProfileData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        vehicleModel: data.vehicleModel || '',
        vehicleYear: data.vehicleYear || '',
        licensePlate: data.licensePlate || '',
        licenseNumber: data.licenseNumber || '',
        rating: data.rating || 0,
        totalTrips: data.totalTrips || 0,
        memberSince: data.memberSince || data.createdAt || '',
        profilePicture: profilePicture
      });
      
      // Update Redux with the profile picture if it's different
      if (profilePicture && profilePicture !== currentUser.profilePicture) {
        dispatch(updateUserProfile({
          profilePicture: profilePicture
        }));
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile data');
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Reset image error state when uploading a new image
      setImageError(false);
      
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        setProfileData({
          ...profileData,
          profilePicture: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUpdateSuccess(false);
    
    // Extract driver ID from currentUser
    const driverId = currentUser?._id || currentUser?.id || currentUser?._doc?._id;
    
    if (!driverId) {
      setError("Could not find user ID. Please sign out and sign in again.");
      return;
    }
    
    try {
      const res = await fetch(`/api/driver/profile/${driverId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phoneNumber: profileData.phoneNumber,
          vehicleModel: profileData.vehicleModel,
          vehicleYear: profileData.vehicleYear,
          licensePlate: profileData.licensePlate,
          licenseNumber: profileData.licenseNumber,
          profilePicture: profileData.profilePicture
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      setUpdateSuccess(true);
      setIsEditing(false);
      setUploadedImage(null);
      
      // Update the profile data with the returned data
      if (data.success) {
        setProfileData(prevData => ({
          ...prevData,
          ...data
        }));
        
        // Also update Redux state
        dispatch(updateUserProfile({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          profilePicture: profileData.profilePicture
        }));
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const handleImageError = () => {
    setImageError(true);
    console.error('Failed to load profile image');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Driver Profile</h2>
          <div className="flex space-x-4">
            {/* Debug buttons - can be removed in production */}
            {isDebugMode && (
              <>
                <button
                  onClick={() => console.log('Current User:', currentUser)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium"
                >
                  Debug User
                </button>
                <button
                  onClick={() => fetchDriverProfile()}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium"
                >
                  Refresh Profile
                </button>
              </>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {updateSuccess && (
          <div className="mb-6 bg-green-50 p-4 rounded-md">
            <p className="text-sm text-green-600">Profile updated successfully!</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Stats */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-center mb-6">
                {(uploadedImage || profileData.profilePicture) && !imageError ? (
                  <div className="relative w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full">
                    <img 
                      src={uploadedImage || profileData.profilePicture} 
                      alt={`${profileData.firstName} ${profileData.lastName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        handleImageError();
                        e.target.src = DEFAULT_PROFILE_IMAGE;
                      }}
                    />
                    {isEditing && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer"
                        onClick={triggerFileInput}
                      >
                        <span className="text-white text-sm font-medium">Change Photo</span>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    className={`w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center ${isEditing ? 'cursor-pointer' : ''}`}
                    onClick={isEditing ? triggerFileInput : undefined}
                  >
                    <span className="text-4xl text-gray-600">
                      {getInitials(profileData.firstName, profileData.lastName)}
                    </span>
                    {isEditing && (
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    )}
                  </div>
                )}
                <h3 className="text-xl font-semibold">
                  {profileData.firstName} {profileData.lastName}
                </h3>
                <p className="text-gray-600">Driver</p>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Rating</p>
                  <div className="flex items-center justify-center mt-1">
                    <span className="text-2xl font-bold text-blue-600">{profileData.rating.toFixed(1)}</span>
                    <span className="text-yellow-400 ml-2">★</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Trips</p>
                  <p className="text-2xl font-bold text-blue-600">{profileData.totalTrips}</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="text-lg font-semibold">{formatDate(profileData.memberSince)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={profileData.vehicleModel}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Year
                  </label>
                  <input
                    type="text"
                    name="vehicleYear"
                    value={profileData.vehicleYear}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Plate
                  </label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={profileData.licensePlate}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Driver's License Number
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={profileData.licenseNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Profile;

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../redux/user/userSlice';
import { getProxiedImageUrl, getInitials, DEFAULT_PROFILE_IMAGE } from '../utils/imageUtils';

function Profile() {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
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
      const res = await fetch(`${baseURL}/api/driver/auth-status`, {
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
          const debugRes = await fetch(`${baseURL}/api/driver/debug-auth`, {
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
      const res = await fetch(`${baseURL}/api/driver/profile/${driverId}`, {
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
      const res = await fetch(`${baseURL}/api/driver/profile/${driverId}`, {
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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-8 pt-20 pb-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-8 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          {/* Profile Header */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-12 left-8">
              <div className="relative">
                {(uploadedImage || profileData.profilePicture) && !imageError ? (
                  <div className="w-24 h-24 rounded-full ring-4 ring-white overflow-hidden bg-white">
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
                        <span className="text-white text-xs">Change</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    className={`w-24 h-24 bg-white rounded-full ring-4 ring-white flex items-center justify-center ${isEditing ? 'cursor-pointer' : ''}`}
                    onClick={isEditing ? triggerFileInput : undefined}
                  >
                    <span className="text-2xl text-gray-600">
                      {getInitials(profileData.firstName, profileData.lastName)}
                    </span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
            
            <div className="absolute top-4 right-6 flex space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isEditing 
                    ? 'bg-white text-blue-600 hover:bg-gray-50'
                    : 'bg-blue-400 text-white hover:bg-blue-300'
                }`}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-16 px-8 pb-8">
            {/* Name and Status */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {profileData.firstName} {profileData.lastName}
              </h1>
              <p className="text-gray-500 mt-1">Driver</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg border border-gray-100 p-4 text-center">
                <div className="flex items-center justify-center text-yellow-400 mb-2">
                  <span className="text-3xl font-bold text-gray-800">{profileData.rating.toFixed(1)}</span>
                  <span className="ml-1">★</span>
                </div>
                <p className="text-sm text-gray-600">Rating</p>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-100 p-4 text-center">
                <div className="text-3xl font-bold text-gray-800 mb-2">{profileData.totalTrips}</div>
                <p className="text-sm text-gray-600">Total Trips</p>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-100 p-4 text-center">
                <div className="text-lg font-semibold text-gray-800 mb-2">{formatDate(profileData.memberSince)}</div>
                <p className="text-sm text-gray-600">Member Since</p>
              </div>
            </div>

            {/* Success/Error Messages */}
            {error && (
              <div className="mb-6 bg-red-50 px-4 py-3 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {updateSuccess && (
              <div className="mb-6 bg-green-50 px-4 py-3 rounded-lg">
                <p className="text-sm text-green-600">Profile updated successfully!</p>
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={profileData.vehicleModel}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Vehicle Year
                  </label>
                  <input
                    type="text"
                    name="vehicleYear"
                    value={profileData.vehicleYear}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    License Plate
                  </label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={profileData.licensePlate}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Driver's License Number
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={profileData.licenseNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Profile;

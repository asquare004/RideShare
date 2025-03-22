import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useSelector } from 'react-redux';
import { FaUser, FaStar, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Profile() {
  const [userProfile, setUserProfile] = useState({
    username: '',
    email: '',
    profilePicture: '',
    rating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!currentUser?._id) {
          console.log("No user ID found in currentUser:", currentUser);
          setLoading(false);
          setError('User not authenticated or session expired');
          return;
        }
        
        console.log("Fetching profile for user ID:", currentUser._id);
        const userData = await userService.getProfile(currentUser._id);
        console.log("Profile data received:", userData);
        
        setUserProfile({
          username: userData.username || '',
          email: userData.email || '',
          profilePicture: userData.profilePicture || '',
          rating: userData.rating || 0
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message || 'Failed to load profile');
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserProfile();
    } else {
      setLoading(false);
      setError('Please sign in to view your profile');
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="mb-6">
              <FaUser className="mx-auto h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Profile Not Available</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            {!currentUser && (
              <Link to="/sign-in" className="inline-block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition duration-200">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header/Banner Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32"></div>
          
          {/* Profile Content */}
          <div className="relative px-6 pb-8">
            {/* Profile Picture */}
            <div className="relative -mt-16 mb-6">
              <div className="w-32 h-32 mx-auto rounded-full shadow-lg overflow-hidden border-4 border-white bg-white">
                {userProfile.profilePicture ? (
                  <img 
                    src={userProfile.profilePicture} 
                    alt={userProfile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <FaUser className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {userProfile.username}
              </h1>
              <div className="flex items-center justify-center space-x-2 text-gray-600 mb-6">
                <FaEnvelope className="w-4 h-4" />
                <span>{userProfile.email}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Rating Card */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-700">Rating</h3>
                  <div className="flex items-center">
                    <FaStar className="w-5 h-5 text-yellow-400 mr-1" />
                    <span className="text-xl font-bold text-gray-900">
                      {userProfile.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Member Since Card */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-700">Member Since</h3>
                  <span className="text-gray-900">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
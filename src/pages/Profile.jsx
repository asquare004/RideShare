import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useSelector } from 'react-redux';
import { FaUser, FaStar, FaEnvelope } from 'react-icons/fa';

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
          throw new Error('User not authenticated');
        }
        const userData = await userService.getProfile(currentUser._id);
        setUserProfile({
          username: userData.username,
          email: userData.email,
          profilePicture: userData.profilePicture,
          rating: userData.rating || 0
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
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
          <div className="text-center text-red-600">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium">Error Loading Profile</h3>
            <p className="mt-2 text-sm">{error}</p>
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
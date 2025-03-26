import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useSelector } from 'react-redux';
import { FaUser, FaStar, FaEnvelope, FaCar, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Profile() {
  const [userProfile, setUserProfile] = useState({
    username: '',
    email: '',
    profilePicture: '',
    rating: 0,
    totalRides: 0,
    memberSince: '',
    favoriteRoutes: []
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
          rating: userData.rating || 0,
          totalRides: userData.totalRides || 0,
          memberSince: userData.createdAt || new Date(),
          favoriteRoutes: userData.favoriteRoutes || []
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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-8 pt-20 pb-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-8 pt-20 pb-8">
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto">
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
          <div className="relative h-32 bg-gradient-to-r from-indigo-400 to-purple-400">
            <div className="absolute -bottom-12 left-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full ring-4 ring-white overflow-hidden bg-white">
                  {userProfile.profilePicture ? (
                    <img 
                      src={userProfile.profilePicture} 
                      alt={userProfile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <FaUser className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-16 px-8 pb-8">
            {/* Name and Status */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800">
                {userProfile.username}
              </h1>
              <div className="flex items-center mt-2 text-gray-500">
                <FaEnvelope className="w-4 h-4 mr-2" />
                <span>{userProfile.email}</span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg border border-gray-100 p-4 text-center hover:border-yellow-300 transition-colors">
                <div className="flex items-center justify-center text-yellow-400 mb-2">
                  <span className="text-3xl font-bold text-gray-800">{userProfile.rating.toFixed(1)}</span>
                  <FaStar className="w-6 h-6 ml-1" />
                </div>
                <p className="text-sm text-gray-500">Rating</p>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-100 p-4 text-center hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold text-gray-800">{userProfile.totalRides}</span>
                  <FaCar className="w-6 h-6 ml-2 text-indigo-400" />
                </div>
                <p className="text-sm text-gray-500">Total Rides</p>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-100 p-4 text-center hover:border-purple-300 transition-colors">
                <div className="flex items-center justify-center mb-2">
                  <FaCalendarAlt className="w-5 h-5 mr-2 text-purple-400" />
                  <span className="text-lg font-semibold text-gray-800">
                    {new Date(userProfile.memberSince).toLocaleDateString('en-US', { 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Member Since</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {userProfile.favoriteRoutes.length > 0 ? (
                  userProfile.favoriteRoutes.map((route, index) => (
                    <div key={index} className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                      <FaMapMarkerAlt className="w-5 h-5 text-indigo-400 mt-1" />
                      <div>
                        <p className="font-medium text-gray-800">{route.name}</p>
                        <p className="text-sm text-gray-500">{route.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity to show</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link 
                to="/" 
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg text-center font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-sm hover:shadow"
              >
                Find a Ride
              </Link>
              <Link 
                to="/my-trips" 
                className="flex-1 bg-white text-indigo-600 px-6 py-3 rounded-lg text-center font-medium border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300"
              >
                View My Trips
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Profile;
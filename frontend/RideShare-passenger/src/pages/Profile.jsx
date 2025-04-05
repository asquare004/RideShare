import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { rideService } from '../services/rideService';
import { useSelector } from 'react-redux';
import { FaUser, FaStar, FaEnvelope, FaCar, FaCalendarAlt, FaMapMarkerAlt, FaRoute, FaHistory } from 'react-icons/fa';
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
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tripLoading, setTripLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTrips: 0,
    createdTrips: 0,
    joinedTrips: 0,
    completedTrips: 0
  });
  
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
        
        if (!userData) {
          throw new Error('No profile data received from server');
        }
        
        setUserProfile({
          username: userData.username || 
                   (userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : 
                   (userData.firstName || userData.lastName || 'User')),
          email: userData.email || currentUser.email || 'No email provided',
          profilePicture: userData.profilePicture || '',
          rating: userData.rating || 0,
          totalRides: userData.totalRides || 0,
          memberSince: userData.createdAt || currentUser.createdAt || new Date(),
          favoriteRoutes: userData.favoriteRoutes || []
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        
        // Use current user data as fallback if profile fetch fails
        if (currentUser) {
          setUserProfile({
            username: currentUser.username || 
                     (currentUser.firstName && currentUser.lastName ? `${currentUser.firstName} ${currentUser.lastName}` : 
                     (currentUser.firstName || currentUser.lastName || 'User')),
            email: currentUser.email || 'No email provided',
            profilePicture: currentUser.profilePicture || '',
            rating: currentUser.rating || 0,
            totalRides: currentUser.totalRides || 0,
            memberSince: currentUser.createdAt || new Date(),
            favoriteRoutes: []
          });
          setError(null); // Clear error since we have fallback data
        } else {
          setError(err.message || 'Failed to load profile');
        }
        setLoading(false);
      }
    };

    const fetchUserTrips = async () => {
      try {
        setTripLoading(true);
        const response = await rideService.getUserRides();
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch rides');
        }
        
        const rides = response.rides || [];
        
        // Calculate stats
        const created = rides.filter(ride => 
          ride.creatorId === currentUser._id || 
          (ride.creator && ride.creator._id === currentUser._id)
        ).length;
        
        const joined = rides.filter(ride => {
          if (ride.creatorId === currentUser._id || (ride.creator && ride.creator._id === currentUser._id)) {
            return false;
          }
          return ride.passengers && ride.passengers.some(p => 
            (p.user?._id === currentUser._id) || (p.user === currentUser._id)
          );
        }).length;
        
        const completed = rides.filter(ride => ride.status === 'completed').length;
        
        setStats({
          totalTrips: rides.length,
          createdTrips: created,
          joinedTrips: joined,
          completedTrips: completed
        });
        
        // Get recent trips
        const recent = rides
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);
          
        setRecentTrips(recent);
        setTripLoading(false);
      } catch (err) {
        console.error("Error fetching user trips:", err);
        setTripLoading(false);
      }
    };

    if (currentUser) {
      fetchUserProfile();
      fetchUserTrips();
    } else {
      setLoading(false);
      setError('Please sign in to view your profile');
    }
  }, [currentUser]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !userProfile.username) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="mb-6">
                <FaUser className="mx-auto h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Profile Not Available</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              {!currentUser && (
                <Link to="/sign-in" className="inline-block w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium rounded-lg text-center transition duration-200">
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
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Some profile data may be incomplete. {error}
                </p>
              </div>
            </div>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Profile Header */}
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-blue-800">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-lg border border-gray-100 p-4 text-center hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-center text-yellow-400 mb-2">
                  <span className="text-3xl font-bold text-gray-800">{userProfile.rating?.toFixed(1) || '0.0'}</span>
                  <FaStar className="w-6 h-6 ml-1" />
                </div>
                <p className="text-sm text-gray-500">Rating</p>
              </motion.div>
              
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-lg border border-gray-100 p-4 text-center hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold text-gray-800">{tripLoading ? '...' : stats.totalTrips}</span>
                  <FaCar className="w-6 h-6 ml-2 text-blue-500" />
                </div>
                <p className="text-sm text-gray-500">Total Trips</p>
              </motion.div>
              
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-lg border border-gray-100 p-4 text-center hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold text-gray-800">{tripLoading ? '...' : stats.createdTrips}</span>
                  <FaRoute className="w-6 h-6 ml-2 text-blue-600" />
                </div>
                <p className="text-sm text-gray-500">Created Trips</p>
              </motion.div>
              
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-lg border border-gray-100 p-4 text-center hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold text-gray-800">{tripLoading ? '...' : stats.joinedTrips}</span>
                  <FaHistory className="w-6 h-6 ml-2 text-blue-700" />
                </div>
                <p className="text-sm text-gray-500">Joined Trips</p>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Trips</h2>
              {tripLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              ) : recentTrips.length > 0 ? (
                <div className="space-y-4">
                  {recentTrips.map((trip, index) => (
                    <motion.div 
                      key={trip._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-gray-100 hover:border-blue-300 hover:shadow-sm transition-all duration-300"
                    >
                      <FaMapMarkerAlt className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                      <div className="flex-grow">
                        <p className="font-medium text-gray-800">{trip.source} to {trip.destination}</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm text-gray-500">{formatDate(trip.date)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            trip.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            trip.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {trip.status?.charAt(0).toUpperCase() + trip.status?.slice(1)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent trips to show</p>
                  <Link 
                    to="/" 
                    className="mt-4 inline-block px-6 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                  >
                    Find your first ride
                  </Link>
                </div>
              )}
            </div>

            {/* Member Since */}
            <div className="flex items-center justify-center mb-8">
              <FaCalendarAlt className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-sm text-gray-500">
                Member since {new Date(userProfile.memberSince).toLocaleDateString('en-US', { 
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/" 
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-lg text-center font-medium hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-sm hover:shadow"
              >
                Find a Ride
              </Link>
              <Link 
                to="/my-trips" 
                className="flex-1 bg-white text-blue-600 px-6 py-3 rounded-lg text-center font-medium border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
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
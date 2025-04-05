import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';

function Home() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalEarnings: 0,
    totalPassengers: 0,
    rating: 0,
    submittedRatingCount: 0,
    ongoingTrips: 0,
    scheduledTrips: 0,
    completedTrips: 0
  });
  const { currentUser } = useSelector(state => state.user);

  useEffect(() => {
    if (currentUser) {
      fetchDriverStats();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchDriverStats = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';
      
      // Get trips by status (ongoing, scheduled, completed) instead of all trips at once
      const [ongoingResponse, scheduledResponse, completedResponse] = await Promise.all([
        axios.get(`${baseUrl}/api/driver/trips/status/ongoing`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          },
          withCredentials: true
        }),
        axios.get(`${baseUrl}/api/driver/trips/status/scheduled`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          },
          withCredentials: true
        }),
        axios.get(`${baseUrl}/api/driver/trips/status/completed`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          },
          withCredentials: true
        })
      ]);
      
      // Combine all trips
      const ongoingTrips = ongoingResponse.data || [];
      const scheduledTrips = scheduledResponse.data || [];
      const completedTrips = completedResponse.data || [];
      
      console.log('Ongoing trips:', ongoingTrips.length);
      console.log('Scheduled trips:', scheduledTrips.length);
      console.log('Completed trips:', completedTrips.length);
      
      // Calculate statistics based on completed trips
      const totalTrips = completedTrips.length;
      
      let totalEarnings = 0;
      let totalPassengers = 0;
      let totalRating = 0;
      let ratingCount = 0;
      let tripsWithRatings = [];
      
      completedTrips.forEach(trip => {
        const bookedSeats = trip.totalSeats - trip.leftSeats;
        totalEarnings += trip.price * bookedSeats;
        totalPassengers += bookedSeats;
        
        let tripHasRating = false;
        
        // If trip has overall rating
        if (trip.rating && trip.rating > 0) {
          totalRating += trip.rating;
          ratingCount++;
          tripHasRating = true;
        }
        
        // Check for passenger ratings in the trip
        let tripPassengerRatings = 0;
        let tripPassengerRatingCount = 0;
        
        if (trip.passengers && Array.isArray(trip.passengers)) {
          trip.passengers.forEach(passenger => {
            if (passenger.rating && passenger.rating > 0) {
              tripPassengerRatings += passenger.rating;
              tripPassengerRatingCount++;
              tripHasRating = true;
            }
          });
        }
        
        // Store trips that have ratings for display purposes
        if (tripHasRating) {
          // Calculate average rating for this trip (if passengers provided ratings)
          const avgTripRating = tripPassengerRatingCount > 0 
            ? tripPassengerRatings / tripPassengerRatingCount 
            : (trip.rating || 0);
            
          tripsWithRatings.push({
            id: trip._id,
            date: trip.date,
            source: trip.source,
            destination: trip.destination,
            rating: avgTripRating
          });
        }
      });
      
      // Sort trips with ratings by date (most recent first)
      tripsWithRatings.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Calculate average rating from trips if available
      const ratingFromTrips = ratingCount > 0 ? (totalRating / ratingCount) : 0;
      
      // Get driver profile for rating - use fetch instead of axios to match Profile.jsx
      const driverId = currentUser?._id || currentUser?.id || currentUser?._doc?._id;
      
      if (!driverId) {
        console.error('Could not find driver ID');
        throw new Error('Driver ID not found');
      }
      
      const profileResponse = await fetch(`${baseUrl}/api/driver/profile/${driverId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      
      // Default to a rating of 4.5 if no ratings available
      // This ensures we always show something in the UI
      let rating = 4.5;
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        // Use profile rating if available, otherwise use calculated rating or default
        if (profileData.rating && profileData.rating > 0) {
          rating = profileData.rating;
        } else if (ratingFromTrips > 0) {
          rating = ratingFromTrips;
        }
      } else {
        console.warn(`Failed to fetch profile: ${profileResponse.status}. Using trip-based or default rating.`);
        // If trip ratings available, use those, otherwise keep default
        if (ratingFromTrips > 0) {
          rating = ratingFromTrips;
        }
      }
      
      setStats({
        totalTrips,
        totalEarnings,
        totalPassengers,
        rating,
        submittedRatingCount: ratingCount,
        ongoingTrips: ongoingTrips.length,
        scheduledTrips: scheduledTrips.length,
        completedTrips: completedTrips.length,
        tripsWithRatings: tripsWithRatings.slice(0, 3) // Only keep the 3 most recent rated trips
      });
    } catch (error) {
      console.error('Error fetching driver stats:', error);
      toast.error('Failed to load statistics. Please try again.');
      
      // Set default stats instead of empty values
      setStats({
        totalTrips: 0,
        totalEarnings: 0,
        totalPassengers: 0,
        rating: 4.5, // Default rating to ensure UI always shows something
        submittedRatingCount: 0,
        ongoingTrips: 0,
        scheduledTrips: 0,
        completedTrips: 0,
        tripsWithRatings: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Driver Dashboard</h2>
              <p className="text-gray-600">
                Welcome {currentUser?.firstName || currentUser?.name?.split(' ')[0] || 'Driver'}
                {currentUser?.lastName ? ` ${currentUser.lastName}` : ''}!
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center mb-2">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              {currentUser && (
                <span className="text-sm text-gray-600">
                  {currentUser.firstName && currentUser.lastName 
                    ? `${currentUser.firstName} ${currentUser.lastName}`
                    : currentUser.name || currentUser.username || 'Driver'}
                </span>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-blue-600">Total Trips</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {loading ? '...' : stats.totalTrips}
                  </p>
                </div>
                <div className="p-2 bg-blue-200 rounded-lg">
                  <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-green-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    ₹{loading ? '...' : stats.totalEarnings}
                  </p>
                </div>
                <div className="p-2 bg-green-200 rounded-lg">
                  <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-purple-600">Total Passengers</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    {loading ? '...' : stats.totalPassengers}
                  </p>
                </div>
                <div className="p-2 bg-purple-200 rounded-lg">
                  <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-yellow-600">Rating</p>
                  <div className="flex items-center mt-1">
                    <p className="text-2xl font-bold text-yellow-900">
                      {loading ? '...' : stats.rating.toFixed(1)}
                    </p>
                    <div className="ml-2 flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(stats.rating)
                              ? 'text-yellow-500'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {stats.submittedRatingCount > 0 && (
                    <p className="text-xs text-yellow-700 mt-1">
                      From {stats.submittedRatingCount} {stats.submittedRatingCount === 1 ? 'rating' : 'ratings'}
                    </p>
                  )}
                </div>
                <div className="p-2 bg-yellow-200 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Trip Status Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Trip Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ongoing Trips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-800">Ongoing Trips</h4>
                </div>
                <div className="pl-13">
                  <p className="text-3xl font-bold text-blue-600">
                    {loading ? '...' : stats.ongoingTrips}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.ongoingTrips === 1 ? 'Trip in progress' : 'Trips in progress'}
                  </p>
                </div>
              </motion.div>

              {/* Scheduled Trips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-indigo-200 rounded-lg p-4 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-800">Scheduled Trips</h4>
                </div>
                <div className="pl-13">
                  <p className="text-3xl font-bold text-indigo-600">
                    {loading ? '...' : stats.scheduledTrips}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.scheduledTrips === 1 ? 'Trip planned' : 'Trips planned'}
                  </p>
                </div>
              </motion.div>

              {/* Completed Trips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border border-green-200 rounded-lg p-4 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-800">Completed Trips</h4>
                </div>
                <div className="pl-13">
                  <p className="text-3xl font-bold text-green-600">
                    {loading ? '...' : stats.completedTrips}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.completedTrips === 1 ? 'Trip completed' : 'Trips completed'}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
              </div>
            ) : stats.totalTrips > 0 ? (
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700">
                  You've completed <span className="font-bold">{stats.totalTrips}</span> trips and earned <span className="font-bold">₹{stats.totalEarnings}</span> so far!
                </p>
                <p className="mt-2 text-gray-700">
                  Your average rating is <span className="font-bold">{stats.rating.toFixed(1)}</span> stars
                  {stats.submittedRatingCount > 0 ? (
                    <span className="text-xs text-gray-500 ml-1">
                      (based on {stats.submittedRatingCount} {stats.submittedRatingCount === 1 ? 'rating' : 'ratings'})
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 ml-1">(default rating)</span>
                  )}
                </p>
                
                {/* Display most recent rated trips if available */}
                {stats.tripsWithRatings && stats.tripsWithRatings.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Recent trip ratings:</p>
                    <div className="space-y-2">
                      {stats.tripsWithRatings.map(trip => (
                        <div key={trip.id} className="flex items-center text-sm">
                          <div className="flex items-center mr-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= Math.round(trip.rating)
                                    ? 'text-yellow-500'
                                    : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-gray-700 mr-2">{new Date(trip.date).toLocaleDateString()}</span>
                          <span className="text-gray-500 truncate">{trip.source} to {trip.destination}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600">You haven't completed any trips yet.</p>
                <p className="mt-2 text-gray-600">When you start giving rides, your stats will appear here.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Home;

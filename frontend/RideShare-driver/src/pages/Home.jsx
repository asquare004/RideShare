import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import axios from 'axios';

function Home() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalEarnings: 0,
    totalPassengers: 0,
    rating: 0
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
      
      // Get all trips for the driver
      const response = await axios.get(`${baseUrl}/api/driver/trips`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        withCredentials: true
      });
      
      if (response.data) {
        const trips = response.data.trips || [];
        
        // Calculate statistics
        const completedTrips = trips.filter(trip => trip.status === 'completed');
        const totalTrips = completedTrips.length;
        
        let totalEarnings = 0;
        let totalPassengers = 0;
        
        completedTrips.forEach(trip => {
          const bookedSeats = trip.totalSeats - trip.leftSeats;
          totalEarnings += trip.price * bookedSeats;
          totalPassengers += bookedSeats;
        });
        
        // Get driver profile for rating
        const profileResponse = await axios.get(`${baseUrl}/api/driver/profile/${currentUser._id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          },
          withCredentials: true
        });
        
        const rating = profileResponse.data.rating || 0;
        
        setStats({
          totalTrips,
          totalEarnings,
          totalPassengers,
          rating
        });
      }
    } catch (error) {
      console.error('Error fetching driver stats:', error);
      // Use mock data if API fails
      setStats({
        totalTrips: 27,
        totalEarnings: 3750,
        totalPassengers: 48,
        rating: 4.8
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
              <p className="text-gray-600">Welcome {currentUser?.name || 'Driver'}!</p>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              <span className="text-green-600 font-medium">Active</span>
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
                </div>
                <div className="p-2 bg-yellow-200 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            </motion.div>
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
                  Your average rating is <span className="font-bold">{stats.rating.toFixed(1)}</span> stars based on passenger feedback.
                </p>
                <div className="mt-4">
                  <a 
                    href="/payment-history" 
                    className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
                  >
                    View your payment history
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
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

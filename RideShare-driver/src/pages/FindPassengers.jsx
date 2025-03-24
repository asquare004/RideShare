import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { toast } from 'react-toastify';

function FindPassengers() {
  const [pendingRides, setPendingRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector(state => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    
    fetchPendingRides();
  }, [currentUser, navigate]);

  const fetchPendingRides = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get rides with pending status
      const response = await api.get('/rides', { 
        params: { status: 'pending' } 
      });
      
      console.log('Pending rides response:', response.data);
      
      setPendingRides(response.data.rides || []);
    } catch (err) {
      console.error('Error fetching pending rides:', err);
      setError('Failed to load pending rides. Please try again.');
      toast.error('Failed to load pending rides');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRide = async (rideId) => {
    try {
      setLoading(true);
      
      // Call the API to accept the ride
      const response = await api.put(`/rides/accept/${rideId}`);
      
      if (response.data.status === 'accepted') {
        toast.success('Ride accepted successfully!');
        // Remove the accepted ride from the list
        setPendingRides(prev => prev.filter(ride => ride._id !== rideId));
        // Navigate to accepted rides view or stay on this page
      }
    } catch (err) {
      console.error('Error accepting ride:', err);
      toast.error(err.response?.data?.message || 'Failed to accept ride');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return dateString;
    }
  };

  // Format time in 12-hour format
  const formatTime = (timeString) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };
  
  // Calculate estimated earnings
  const calculateEarnings = (price, seats) => {
    return price * seats;
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Find Passengers</h2>
              <p className="mt-1 text-sm text-gray-600">
                Browse and accept rides from passengers looking for drivers
              </p>
            </div>
            <button
              onClick={fetchPendingRides}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {!loading && pendingRides.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No pending rides</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no passengers currently looking for a ride. Check back later!
              </p>
            </div>
          )}

          {/* Ride Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRides.map((ride) => (
              <div 
                key={ride._id} 
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Card Header - Date & Time */}
                <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Departure</div>
                      <div className="font-medium text-gray-800">{formatDate(ride.date)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Time</div>
                      <div className="font-medium text-gray-800">{formatTime(ride.departureTime)}</div>
                    </div>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="px-4 py-4">
                  {/* Route */}
                  <div className="mb-4">
                    <div className="flex items-start">
                      <div className="relative mr-3">
                        <div className="h-4 w-4 rounded-full bg-green-400"></div>
                        <div className="h-full border-l-2 border-dashed border-gray-300 absolute top-4 left-2"></div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">From</div>
                        <div className="font-medium text-gray-800">{ride.source}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start mt-2">
                      <div className="mr-3">
                        <div className="h-4 w-4 rounded-full bg-red-400"></div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">To</div>
                        <div className="font-medium text-gray-800">{ride.destination}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ride Details */}
                  <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-200 pt-3">
                    <div>
                      <div className="text-xs text-gray-500">Seats</div>
                      <div className="font-semibold">{ride.leftSeats}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Distance</div>
                      <div className="font-semibold">{ride.distance} km</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Price</div>
                      <div className="font-semibold text-blue-600">₹{ride.price}</div>
                    </div>
                  </div>
                  
                  {/* Total Earnings */}
                  <div className="mt-3 bg-gray-50 -mx-4 px-4 py-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">Potential Earnings:</div>
                      <div className="font-bold text-green-600">
                        ₹{calculateEarnings(ride.price, ride.leftSeats)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Card Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => handleAcceptRide(ride._id)}
                    disabled={loading}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Accept This Ride
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindPassengers; 
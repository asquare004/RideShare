import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function FindPassengers() {
  const [passengerRequests, setPassengerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector(state => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch requests if user is logged in
    if (currentUser) {
      fetchPassengerRequests();
    } else {
      // Set loading to false if not logged in
      setLoading(false);
    }
  }, [currentUser]);

  const fetchPassengerRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rides/passenger-requests', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch passenger requests');
      }

      const data = await response.json();
      setPassengerRequests(data);
    } catch (err) {
      console.error('Error fetching passenger requests:', err);
      setError('Failed to load passenger requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRide = async (rideId) => {
    try {
      const response = await fetch(`/api/rides/accept-request/${rideId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to accept ride request');
      }

      // Update the UI to reflect the acceptance
      setPassengerRequests(prev => 
        prev.map(req => 
          req._id === rideId 
            ? { ...req, status: 'accepted', driverId: currentUser._id } 
            : req
        )
      );

      // Show success message
      alert('Ride request accepted successfully!');
    } catch (err) {
      console.error('Error accepting ride request:', err);
      alert('Failed to accept ride request. Please try again.');
    }
  };

  const handleRejectRide = async (rideId) => {
    try {
      const response = await fetch(`/api/rides/reject-request/${rideId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to reject ride request');
      }

      // Remove the rejected ride from the list
      setPassengerRequests(prev => 
        prev.filter(req => req._id !== rideId)
      );

      // Show success message
      alert('Ride request rejected successfully.');
    } catch (err) {
      console.error('Error rejecting ride request:', err);
      alert('Failed to reject ride request. Please try again.');
    }
  };

  // Format date to readable format
  const formatDateTime = (dateStr, timeStr) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-center">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-center mt-4 text-gray-600">Loading passenger requests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{error}</h3>
              <div className="mt-6">
                <button
                  onClick={fetchPassengerRequests}
                  className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not logged in, show a prompt to sign in instead of automatically redirecting
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Sign in required</h3>
              <p className="mt-2 text-sm text-gray-500">
                You need to be signed in as a driver to view passenger requests.
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => navigate('/sign-in')}
                  className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Sign In
                </button>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">
                  State debug: {JSON.stringify({userExists: !!currentUser, userInfo: currentUser ? 'User data exists' : 'No user data'})}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Find Passengers</h2>
            <p className="mt-1 text-sm text-gray-600">
              View ride requests from passengers and accept rides that match your route
            </p>
          </div>

          {passengerRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No passenger requests available</h3>
              <p className="mt-2 text-sm text-gray-500">
                Check back later for new ride requests from passengers.
              </p>
              <div className="mt-6">
                <button
                  onClick={fetchPassengerRequests}
                  className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Refresh
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {passengerRequests.map((request) => (
                <div 
                  key={request._id} 
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {request.source.split(',')[0]} → {request.destination.split(',')[0]}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {request.distance} km
                      </span>
                    </div>
                  </div>

                  <div className="px-4 py-3">
                    <div className="flex items-center text-sm text-gray-700 mb-2">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {formatDateTime(request.date, request.departureTime)}
                    </div>

                    <div className="flex items-center text-sm text-gray-700 mb-2">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {request.leftSeats} {request.leftSeats === 1 ? 'passenger' : 'passengers'}
                    </div>

                    <div className="flex items-center text-sm text-gray-700 mb-2">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-blue-700">₹{request.price}</span>
                      <span className="ml-1 text-gray-500">per seat</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-700 mb-4">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <div className="line-clamp-1 text-gray-700">
                        {request.source}
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-700 mb-4">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <div className="line-clamp-1 text-gray-700">
                        {request.destination}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleAcceptRide(request._id)}
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRide(request._id)}
                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FindPassengers; 
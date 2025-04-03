import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { currentUser } = useSelector(state => state.user);
  const navigate = useNavigate();
  const activeTabRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    // Debug function to check driver authentication
    const checkDriverAuth = async () => {
      try {
        const baseUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:5000' 
          : '';
        
        // Check driver authentication cookies
        console.log('Current cookies:', document.cookie);
        
        // Check if we have redux state for driver
        console.log('Current user from Redux:', currentUser);
        
        // Test the basic driver endpoint
        const testResponse = await fetch(`${baseUrl}/api/driver/session-info`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        console.log('Driver session info response:', testResponse.status);
        if (testResponse.ok) {
          const data = await testResponse.json();
          console.log('Driver session data:', data);
        } else {
          console.error('Failed to get driver session info');
        }
      } catch (err) {
        console.error('Error checking driver auth:', err);
      }
    };
    
    // Run auth check only on initial load
    if (!activeTabRef.current) {
      checkDriverAuth();
    }
    
    // Keep track of tab changes
    activeTabRef.current = activeTab;
    
    // Log the current tab
    console.log('Current active tab:', activeTab);
    
    // Fetch trips based on the current tab
    fetchTrips();
  }, [currentUser, activeTab]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      // Use the correct base URL if in development environment
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000' 
        : '';
      
      // Determine the endpoint based on activeTab
      let endpoint;
      switch(activeTab) {
        case 'current':
          endpoint = '/api/driver/trips/status/ongoing';
          break;
        case 'upcoming':
          endpoint = '/api/driver/trips/status/scheduled';
          break;
        case 'past':
          endpoint = '/api/driver/trips/status/completed';
          break;
        default:
          endpoint = '/api/driver/trips/status/scheduled';
      }
      
      const fullUrl = `${baseUrl}${endpoint}`;
      console.log(`Fetching trips from: ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${activeTab} trips: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Received ${data.length} trips:`, data);
      setTrips(data);
    } catch (err) {
      console.error(`Error in fetchTrips for ${activeTab} tab:`, err);
      setError(`Failed to load ${activeTab} trips. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

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

  const handleViewDetails = (trip) => {
    setSelectedTrip(trip);
    setShowDetailsModal(true);
  };

  const handleCancelRide = async (tripId) => {
    try {
      // Show confirmation dialog
      const confirmed = window.confirm(
        'Are you sure you want to cancel this trip? This action cannot be undone.'
      );
      
      if (!confirmed) {
        return;
      }

      // Use the correct base URL if in development environment
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000' 
        : '';

      // Proceed with cancellation
      const response = await fetch(`${baseUrl}/api/driver/trips/cancel/${tripId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: currentUser._id
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.headers.get('content-type')?.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to cancel trip');
        } else {
          throw new Error(`Failed to cancel trip: ${response.status} ${response.statusText}`);
        }
      }

      // Remove the canceled trip from the list
      setTrips(trips.filter(trip => trip._id !== tripId));
      
      // Show success message
      toast.success('Trip canceled successfully');
    } catch (err) {
      console.error('Error canceling trip:', err);
      toast.error(err.message || 'Failed to cancel trip. Please try again.');
    }
  };

  const handleStartRide = async (tripId) => {
    try {
      console.log('Starting ride with ID:', tripId);
      
      // Show loading toast
      const loadingToast = toast.loading('Starting trip...');
      
      // Use direct fetch instead of API utility to bypass potential middleware issues
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000' 
        : '';
      
      const response = await fetch(`${baseUrl}/api/rides/${tripId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      // Clear loading toast
      toast.dismiss(loadingToast);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to start ride');
      }
      
      const data = await response.json();
      console.log('Start ride response:', data);
      
      if (data && data.success) {
        toast.success('Trip started successfully');
        
        // Update local state
        if (activeTab === 'upcoming') {
          setTrips(prevTrips => prevTrips.filter(trip => trip._id !== tripId));
        }
        
        // Switch to current tab
        setActiveTab('current');
        
        // Refresh data
        fetchTrips();
      } else {
        throw new Error(data?.message || 'Failed to start trip');
      }
    } catch (err) {
      console.error('Error starting trip:', err);
      
      // Show error toast
      toast.error(err.message || 'Failed to start trip. Please try again.');
    }
  };

  const handleEndRide = async (tripId) => {
    try {
      console.log('Ending ride with ID:', tripId);
      
      // Show loading toast
      const loadingToast = toast.loading('Ending trip...');
      
      // Use direct fetch instead of API utility to bypass potential middleware issues
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000' 
        : '';
      
      const response = await fetch(`${baseUrl}/api/rides/${tripId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      // Clear loading toast
      toast.dismiss(loadingToast);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to end ride');
      }
      
      const data = await response.json();
      console.log('End ride response:', data);
      
      if (data && data.success) {
        toast.success('Trip completed successfully');
        
        // Update local state
        if (activeTab === 'current') {
          setTrips(prevTrips => prevTrips.filter(trip => trip._id !== tripId));
        }
        
        // Switch to past tab
        setActiveTab('past');
        
        // Refresh data
        fetchTrips();
      } else {
        throw new Error(data?.message || 'Failed to end trip');
      }
    } catch (err) {
      console.error('Error ending trip:', err);
      
      // Show error toast
      toast.error(err.message || 'Failed to end trip. Please try again.');
    }
  };

  // Function to get border color based on status
  const getBorderColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'scheduled': return 'border-green-400';
      case 'pending': return 'border-yellow-400';
      case 'completed': return 'border-blue-400';
      case 'cancelled': return 'border-red-400';
      case 'ongoing': return 'border-purple-400';
      default: return 'border-gray-300';
    }
  };

  // Function to get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'scheduled': { 
        bgColor: 'bg-green-100', 
        textColor: 'text-green-800', 
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      'pending': { 
        bgColor: 'bg-yellow-100', 
        textColor: 'text-yellow-800', 
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      'completed': { 
        bgColor: 'bg-blue-100', 
        textColor: 'text-blue-800', 
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        )
      },
      'cancelled': { 
        bgColor: 'bg-red-100', 
        textColor: 'text-red-800', 
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      },
      'ongoing': { 
        bgColor: 'bg-purple-100', 
        textColor: 'text-purple-800', 
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      }
    };
    
    const config = statusConfig[status?.toLowerCase()] || statusConfig.scheduled;
    
    return (
      <span className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        {config.icon}
        {status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Scheduled'}
      </span>
    );
  };

  // Sign-in required notice
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
                You need to be signed in to view your trips.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/sign-in')}
                  className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderRideCard = (trip) => {
    // Calculate booked seats
    const totalSeats = trip.totalSeats || 4;
    const bookedSeats = totalSeats - (trip.leftSeats || 0);
    const earnings = trip.price * bookedSeats;
    
    return (
      <div 
        key={trip._id}
        className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${getBorderColor(trip.status)} border-l-4`}
      >
        {/* Trip Header */}
        <div className="bg-gray-50 p-3 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
                {trip.distance} km
              </span>
              {getStatusBadge(trip.status)}
            </div>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ₹{earnings}
            </span>
          </div>
          
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">From</p>
                <p className="font-medium text-gray-900 truncate text-sm">{trip.source.split(',')[0]}</p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">To</p>
                <p className="font-medium text-gray-900 truncate text-sm">{trip.destination.split(',')[0]}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trip Details */}
        <div className="p-3">
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Date and Time */}
            <div className="flex items-start">
              <div className="p-1.5 bg-blue-50 rounded-lg mr-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date & Time</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(trip.date).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-600">{trip.departureTime}</p>
              </div>
            </div>
            
            {/* Price Details */}
            <div className="flex items-start">
              <div className="p-1.5 bg-green-50 rounded-lg mr-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Price Details</p>
                <p className="text-sm font-medium text-green-600">₹{trip.price} per seat</p>
                <p className="text-xs text-gray-600">
                  Total: ₹{earnings}
                </p>
              </div>
            </div>
            
            {/* Seats */}
            <div className="flex items-start">
              <div className="p-1.5 bg-purple-50 rounded-lg mr-2">
                <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Passengers</p>
                <div className="flex items-center mt-1">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{bookedSeats}/{totalSeats} booked</span>
                      <div className="ml-2 flex space-x-1">
                        {[...Array(totalSeats)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < bookedSeats ? 'bg-purple-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {bookedSeats === totalSeats 
                        ? 'Fully booked' 
                        : `${totalSeats - bookedSeats} seat${totalSeats - bookedSeats !== 1 ? 's' : ''} available`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Passenger List */}
            <div className="flex items-start">
              <div className="p-1.5 bg-indigo-50 rounded-lg mr-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Passenger List</p>
                {trip.passengers && trip.passengers.length > 0 ? (
                  <div className="mt-1">
                    {trip.passengers.slice(0, 2).map((passenger, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <span className="font-medium text-gray-900">{passenger.name}</span>
                        {passenger.rating && (
                          <div className="flex items-center ml-2">
                            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs ml-1 text-gray-600">{passenger.rating}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {trip.passengers.length > 2 && (
                      <p className="text-xs text-gray-500 mt-1">
                        +{trip.passengers.length - 2} more passengers
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No passengers yet</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => handleViewDetails(trip)}
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </button>
            
            {trip.status === 'scheduled' && (
              <button
                onClick={() => handleStartRide(trip._id)}
                className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Ride
              </button>
            )}
            
            {trip.status === 'ongoing' && (
              <button
                onClick={() => handleEndRide(trip._id)}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                End Ride
              </button>
            )}
            
            {(trip.status === 'scheduled' || trip.status === 'pending') && (
              <button
                onClick={() => handleCancelRide(trip._id)}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel Ride
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-8 pt-20 pb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-900">My Trips</h2>
            <p className="mt-0.5 text-sm text-gray-600">
              View and manage all your trips as a driver
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-4">
              <button
                onClick={() => setActiveTab('current')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'current'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Current Trips
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upcoming'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upcoming Trips
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'past'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Past Trips
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gray-50 mb-4">
                  {activeTab === 'current' ? (
                    <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ) : activeTab === 'upcoming' ? (
                    <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )}
                </div>
                <p className="text-gray-700 text-xl font-semibold">
                  {activeTab === 'current' 
                    ? 'No active trips at the moment'
                    : activeTab === 'upcoming'
                    ? 'No upcoming trips scheduled'
                    : 'No past trips found'}
                </p>
                <p className="text-gray-500 text-sm mt-3 max-w-sm mx-auto">
                  {activeTab === 'current'
                    ? 'Your active trips will appear here when you start a ride'
                    : activeTab === 'upcoming'
                    ? 'Your scheduled trips will appear here when you create or accept a ride'
                    : 'Your completed trips will appear here after you finish a ride'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trips.map((trip) => renderRideCard(trip))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trip Details Modal */}
      {showDetailsModal && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Trip Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Trip Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  {getStatusBadge(selectedTrip.status)}
                </div>

                {/* Route Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Route</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-medium text-gray-900">{selectedTrip.source}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">To</p>
                      <p className="font-medium text-gray-900">{selectedTrip.destination}</p>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Date & Time</h4>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedTrip.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">{selectedTrip.departureTime}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Distance</h4>
                    <p className="text-sm text-gray-900">{selectedTrip.distance} km</p>
                  </div>
                </div>

                {/* Price Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Price Details</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Price per seat</span>
                      <span className="text-sm font-medium text-gray-900">₹{selectedTrip.price}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">Total seats</span>
                      <span className="text-sm font-medium text-gray-900">{selectedTrip.totalSeats}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">Available seats</span>
                      <span className="text-sm font-medium text-gray-900">{selectedTrip.leftSeats}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-900">Total earnings</span>
                      <span className="text-sm font-medium text-green-600">
                        ₹{selectedTrip.price * (selectedTrip.totalSeats - selectedTrip.leftSeats)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Passenger List */}
                {selectedTrip.passengers && selectedTrip.passengers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Passengers</h4>
                    <div className="space-y-2">
                      {selectedTrip.passengers.map((passenger, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{passenger.name}</p>
                            <p className="text-xs text-gray-500">{passenger.phone}</p>
                          </div>
                          {passenger.rating && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-sm ml-1 text-gray-600">{passenger.rating}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Close
                </button>
                {selectedTrip.status !== 'cancelled' && selectedTrip.status !== 'completed' && (
                  <button
                    onClick={() => handleCancelRide(selectedTrip._id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Cancel Trip
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTrips; 
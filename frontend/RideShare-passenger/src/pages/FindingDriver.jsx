import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';
import { motion } from 'framer-motion';
import { rideService } from '../services/rideService';
import RiderFound from '../components/RiderFound';

function FindingDriver() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [driverFound, setDriverFound] = useState(false);
  const [driverDetails, setDriverDetails] = useState(null);
  const [rideDetails, setRideDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelled, setIsCancelled] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [ride, setRide] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [driver, setDriver] = useState(null);
  const [cancellingRide, setCancellingRide] = useState(false);
  
  const MAX_SEARCH_TIME = 300; // 5 minutes in seconds
  
  // Load ride details initially
  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        console.log(`Fetching ride details for ID: ${rideId}`);
        const response = await api.get(`/rides/${rideId}`);
        console.log('Ride details response:', response.data);
        console.log('leftSeats value:', response.data.leftSeats);
        console.log('leftSeats type:', typeof response.data.leftSeats);
        
        // Ensure leftSeats is parsed as a number
        const rideData = {
          ...response.data,
        };
        
        console.log('Processed ride data:', rideData);
        setRideDetails(rideData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching ride details:', error);
        // Handle 404 errors specifically
        if (error.response && error.response.status === 404) {
          setError('Ride not found. It may have been cancelled or completed.');
        } else {
          setError('Could not load ride details. Please try again or contact support.');
        }
        setIsLoading(false);
      }
    };
    
    if (rideId) {
      fetchRideDetails();
    }
  }, [rideId]);
  
  // Timer effect for countdown
  useEffect(() => {
    // Only start timer if we have ride details and haven't found a driver yet
    if (!rideDetails || driverFound || isCancelled) return;
    
    const timer = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1;
        
        // If maximum search time reached, stop the timer
        if (newTime >= MAX_SEARCH_TIME) {
          clearInterval(timer);
          handleTimerEnd();
          return MAX_SEARCH_TIME;
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer); // Cleanup timer
  }, [rideDetails, driverFound, isCancelled]);
  
  // Handle timeout if no driver found within MAX_SEARCH_TIME
  useEffect(() => {
    if (elapsedTime >= MAX_SEARCH_TIME && !driverFound && !isCancelled) {
      handleTimerEnd();
    }
  }, [elapsedTime, driverFound, isCancelled]);
  
  // Handle timer end - delete ride if no driver found
  const handleTimerEnd = async () => {
    try {
      setCancellingRide(true);
      // Delete the ride from database when timer ends
      try {
        await rideService.deleteRide(rideId);
      } catch (deleteError) {
        // If ride is not found (404), it's already been deleted - that's fine
        if (deleteError.message && deleteError.message.includes('not found')) {
          console.log('Ride already deleted or not found, continuing with cancellation UI');
        } else {
          // For other errors, rethrow to be caught by the outer catch
          throw deleteError;
        }
      }
      // Show cancellation UI instead of redirecting
      setIsCancelled(true);
    } catch (error) {
      console.error('Error deleting ride after timeout:', error);
      setError('Failed to cancel the ride. Please try again.');
    } finally {
      setCancellingRide(false);
    }
  };
  
  // Effect to periodically check ride status
  useEffect(() => {
    // Only poll if we have ride details and haven't found a driver yet
    if (!rideDetails || driverFound || isCancelled) return;
    
    const checkDriverAcceptance = async () => {
      try {
        console.log(`Checking ride status for ID: ${rideId}`);
        const response = await api.get(`/rides/pending-status/${rideId}`);
        console.log('Ride status response:', response.data);
        
        // If a driver has accepted the ride
        if (response.data.status === 'accepted') {
          console.log('Driver found! Driver details:', response.data.driver);
          
          // Ensure we have driver information
          const driverInfo = response.data.driver || {};
          
          // Make sure we have required fields for display
          const processedDriverInfo = {
            _id: driverInfo._id || driverInfo.id || 'unknown',
            firstName: driverInfo.firstName || 'Driver',
            lastName: driverInfo.lastName || '',
            phoneNumber: driverInfo.phoneNumber || 'N/A',
            email: driverInfo.email || 'N/A',
            profilePicture: driverInfo.profilePicture || '',
            rating: driverInfo.rating || 0,
            totalTrips: driverInfo.totalTrips || 0,
            vehicleModel: driverInfo.vehicleModel || 'N/A',
            vehicleYear: driverInfo.vehicleYear || '',
            licensePlate: driverInfo.licensePlate || 'N/A'
          };
          
          console.log('Processed driver info:', processedDriverInfo);
          
          setDriverFound(true);
          setDriverDetails(processedDriverInfo);
          
          // Update ride details with the latest info
          const updatedRideData = {
            ...response.data.ride,
            leftSeats: typeof response.data.ride.leftSeats === 'string' 
              ? parseInt(response.data.ride.leftSeats, 10)
              : response.data.ride.leftSeats,
            driverInfo: processedDriverInfo // Ensure driver info is attached to ride
          };
          
          console.log('Updated ride data after driver acceptance:', updatedRideData);
          setRideDetails(updatedRideData);
          
          // Show the driver details modal
          setShowDriverModal(true);
        } else if (response.data.status === 'cancelled') {
          setIsCancelled(true);
        }
      } catch (error) {
        console.error('Error checking ride status:', error);
        // Don't show error to the user immediately for status checks - just log it
        // Only show error if we've failed multiple times consecutively
        if (error.response && error.response.status === 404) {
          console.warn('Ride not found during status check, might have been deleted');
        }
      }
    };
    
    // Check immediately and then at intervals
    checkDriverAcceptance();
    
    const pollInterval = setInterval(checkDriverAcceptance, 5000); // Check every 5 seconds
    
    return () => clearInterval(pollInterval); // Cleanup interval
  }, [rideId, rideDetails, driverFound, isCancelled]);
  
  // Handle manual cancellation by user
  const handleCancelSearch = async () => {
    try {
      setCancellingRide(true);
      // Delete the ride from database
      try {
        await rideService.deleteRide(rideId);
      } catch (deleteError) {
        // If ride is not found (404), it's already been deleted - that's fine
        if (deleteError.message && deleteError.message.includes('not found')) {
          console.log('Ride already deleted or not found, continuing with cancellation UI');
        } else {
          // For other errors, rethrow to be caught by the outer catch
          throw deleteError;
        }
      }
      // Show cancellation UI instead of redirecting
      setIsCancelled(true);
    } catch (error) {
      console.error('Error cancelling ride:', error);
      setError('Failed to cancel the ride. Please try again.');
    } finally {
      setCancellingRide(false);
    }
  };
  
  // Format remaining time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Handle view trip details button click
  const handleViewTripDetails = () => {
    // Navigate to the My Trips page with force refresh to ensure data is loaded
    console.log('Navigating to my-trips page');
    // Use window.location for a hard redirect to ensure page fully reloads
    window.location.href = '/my-trips';
  };
  
  // Ensures the modal is properly displayed and can be closed
  const closeModal = () => {
    setShowDriverModal(false);
  };

  // Add event listener to handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showDriverModal) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showDriverModal]);
  
  const remainingTime = MAX_SEARCH_TIME - elapsedTime;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ride details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 pt-24">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-center">
              <svg className="h-12 w-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="mt-2 text-xl font-semibold text-gray-900">Error</h2>
              <p className="mt-2 text-gray-600">{error}</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => navigate('/')}
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (driverFound && driverDetails) {
    return <RiderFound driver={driverDetails} ride={rideDetails} />;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 pt-24">
      {/* Driver Found Modal */}
      {showDriverModal && driverDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div 
              className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Driver Found!
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Great news! A driver has accepted your ride request.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Driver Details */}
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Driver Details</h4>
                  <div className="mt-3 flex items-center">
                    <div className="flex-shrink-0">
                      {driverDetails.profilePicture ? (
                        <img 
                          className="h-12 w-12 rounded-full object-cover" 
                          src={driverDetails.profilePicture} 
                          alt={`${driverDetails.firstName} ${driverDetails.lastName}`} 
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h5 className="text-sm font-medium text-gray-900">{driverDetails.firstName} {driverDetails.lastName}</h5>
                      <div className="flex items-center mt-1">
                        <svg className="text-yellow-400 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm text-gray-500">
                          {driverDetails.rating ? driverDetails.rating.toFixed(1) : 'New'} • {driverDetails.totalTrips || 0} trips
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Vehicle Details */}
                {driverDetails.vehicleModel && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Vehicle Details</h4>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Vehicle</p>
                        <p className="text-sm font-medium">{driverDetails.vehicleModel} {driverDetails.vehicleYear}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">License Plate</p>
                        <p className="text-sm font-medium">{driverDetails.licensePlate}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Trip Summary in the modal */}
                <div className="mt-5 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Trip Summary</h4>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-500">From</p>
                      <p className="text-sm font-medium text-gray-800">{rideDetails?.source}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-500">To</p>
                      <p className="text-sm font-medium text-gray-800">{rideDetails?.destination}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="text-sm font-medium text-gray-800">
                        {rideDetails?.createdAt ? new Date(rideDetails.createdAt).toLocaleString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Not specified'}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-500">Seats</p>
                      <p className="text-sm font-medium text-gray-800">
                        {(() => {
                          const totalSeats = 4;
                          let bookedSeats;
                          if (rideDetails?.availableSeats !== undefined) {
                            bookedSeats = rideDetails.availableSeats;
                          } else if (rideDetails?.leftSeats !== undefined) {
                            bookedSeats = 4 - rideDetails.leftSeats;
                          } else {
                            bookedSeats = 1;
                          }
                          return `${bookedSeats} out of ${totalSeats}`;
                        })()}
                      </p>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                      <p className="text-sm font-medium text-gray-500">Price per seat</p>
                      <p className="text-sm font-medium text-blue-600">₹{rideDetails?.price}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-500">Total fare</p>
                      <p className="text-sm font-semibold text-amber-600">
                        {(() => {
                          let bookedSeats;
                          if (rideDetails?.availableSeats !== undefined) {
                            bookedSeats = rideDetails.availableSeats;
                          } else if (rideDetails?.leftSeats !== undefined) {
                            bookedSeats = 4 - rideDetails.leftSeats;
                          } else {
                            bookedSeats = 1;
                          }
                          const totalFare = bookedSeats * (rideDetails?.price || 0);
                          return `₹${totalFare}`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row-reverse gap-2">
                <a
                  href="/my-trips"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  View Trip Details
                </a>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-4">
        <motion.div 
          className="bg-white rounded-lg shadow-md overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            {driverFound ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mt-3 text-lg font-medium text-gray-900">Driver Found!</h2>
                <p className="mt-1 text-sm text-gray-500">
                  A driver has accepted your ride request.
                </p>
              </div>
            ) : isCancelled ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="mt-3 text-lg font-medium text-gray-900">Search Cancelled</h2>
                <p className="mt-1 text-sm text-gray-500">
                  No drivers accepted your ride within the time limit.
                </p>
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-4">
                  <p className="text-sm text-amber-700">
                    Tip: Consider increasing your fare to improve chances of finding a driver.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate('/create-ride')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    Try Again with Higher Fare
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">Finding you a driver</h2>
                <p className="mt-1 text-sm text-gray-500">
                  This shouldn't take long. Please wait...
                </p>
                <div className="mt-5 flex justify-center">
                  <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500"></div>
                </div>
                
                {/* Timer display with progress bar */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-medium text-gray-500">Time remaining</p>
                    <p className="text-xs font-medium text-blue-600">{formatTime(remainingTime)}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${(remainingTime / MAX_SEARCH_TIME) * 100}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Searching nearby drivers. You can cancel anytime.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Ride Summary */}
          <div className="px-6 py-4 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ride Summary</h3>
            <div className="mt-3 space-y-3">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">From</p>
                  <p className="font-medium">{rideDetails?.source}</p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">To</p>
                  <p className="font-medium">{rideDetails?.destination}</p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Price per person</p>
                  <p className="font-medium text-blue-600">₹{rideDetails?.price}</p>
                </div>
              </div>

              {/* Adding date/time information */}
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date & Time</p>
                  <p className="font-medium">
                    {rideDetails?.createdAt ? new Date(rideDetails.createdAt).toLocaleString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Add back seats information */}
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Seats</p>
                  <p className="font-medium">
                    {rideDetails ? (() => {
                      const totalSeats = 4; // Always 4 seats total in the system
                      
                      // Calculate booked seats
                      let bookedSeats;
                      if (rideDetails.availableSeats !== undefined) {
                        bookedSeats = rideDetails.availableSeats;
                      } else if (rideDetails.leftSeats !== undefined) {
                        bookedSeats = 4 - rideDetails.leftSeats;
                      } else {
                        bookedSeats = 1;
                      }
                      
                      return `${bookedSeats} out of ${totalSeats} seats`;
                    })() : 'Loading...'}
                  </p>
                </div>
              </div>

              {/* Adding total fare calculation */}
              <div className="flex mt-2 pt-3 border-t border-gray-200">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-amber-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Fare</p>
                  <p className="text-lg font-semibold text-amber-600">
                    {rideDetails ? (() => {
                      // Calculate booked seats
                      let bookedSeats;
                      if (rideDetails.availableSeats !== undefined) {
                        bookedSeats = rideDetails.availableSeats;
                      } else if (rideDetails.leftSeats !== undefined) {
                        bookedSeats = 4 - rideDetails.leftSeats;
                      } else {
                        bookedSeats = 1;
                      }
                      
                      const totalFare = bookedSeats * (rideDetails.price || 0);
                      return `₹${totalFare}`;
                    })() : 'Calculating...'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {!driverFound && !isCancelled && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handleCancelSearch}
                className="w-full py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {cancellingRide ? 'Cancelling...' : 'Cancel Search'}
              </button>
            </div>
          )}
          
          {driverFound && !showDriverModal && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <a
                href="/my-trips"
                className="w-full py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center transition-colors duration-200"
              >
                <span>View Trip Details</span>
                <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          )}
          
          {isCancelled && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => navigate('/')}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Home
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default FindingDriver; 
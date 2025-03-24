import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { rideService } from '../services/rideService';
import { toast } from 'react-toastify';

function RideDetail() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/sign-in', { state: { returnTo: `/ride/${rideId}` } });
      return;
    }
    
    fetchRideDetails();
  }, [rideId, currentUser, navigate]);
  
  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      const data = await rideService.getUserRideById(rideId);
      setRide(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching ride details:', err);
      setError(err.message || 'Failed to load ride details');
      setLoading(false);
    }
  };
  
  const formatDateTime = (dateStr, timeStr) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
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
            <div className="flex justify-center py-10">
              <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
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
            <div className="text-center py-10">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{error}</h3>
              <div className="mt-6">
                <div className="grid grid-cols-1 gap-6 mt-4">
                  <button
                    onClick={() => navigate('/my-trips')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back to My Trips
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-100 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-10">
              <h3 className="text-lg font-medium text-gray-900">Ride not found</h3>
              <div className="mt-6">
                <div className="grid grid-cols-1 gap-6 mt-4">
                  <button
                    onClick={() => navigate('/my-trips')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back to My Trips
                  </button>
                </div>
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Ride Details</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-800 text-white">
                {ride.status}
              </span>
            </div>
          </div>
          
          {/* Ride Info */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between">
              <div className="mb-6 md:mb-0 md:w-7/12">
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                      <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">FROM</h3>
                    <p className="text-base font-medium text-gray-900">{ride.source}</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
                      <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">TO</h3>
                    <p className="text-base font-medium text-gray-900">{ride.destination}</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
                      <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">DEPARTURE TIME</h3>
                    <p className="text-base font-medium text-gray-900">
                      {formatDateTime(ride.date, ride.departureTime)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-yellow-100">
                      <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">PRICE</h3>
                    <p className="text-base font-medium text-gray-900">₹{ride.price} per seat</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100">
                      <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">SEATS</h3>
                    <p className="text-base font-medium text-gray-900">
                      {(() => {
                        // Handle cases where the properties might be undefined
                        const totalSeats = ride.totalSeats || 4; // Default to 4 if undefined
                        const leftSeats = typeof ride.leftSeats === 'number' ? ride.leftSeats : 0;
                        const bookedSeats = ride.bookedSeats || (totalSeats - leftSeats);
                        
                        return `${bookedSeats} out of ${totalSeats} seats booked`;
                      })()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100">
                      <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">DISTANCE</h3>
                    <p className="text-base font-medium text-gray-900">{ride.distance} km</p>
                  </div>
                </div>
              </div>
              
              {/* Driver Info */}
              {(ride.driverInfo || ride.driverId) && (
                <div className="bg-gray-50 rounded-lg p-6 md:w-4/12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Information</h3>
                  
                  <div className="flex items-center mb-4">
                    {(ride.driverInfo?.profilePicture || ride.driverId?.profilePicture) ? (
                      <img 
                        src={ride.driverInfo?.profilePicture || ride.driverId?.profilePicture} 
                        alt="Driver" 
                        className="h-14 w-14 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/56?text=Driver';
                        }}
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xl text-gray-600 font-medium">
                          {`${(ride.driverInfo?.firstName || ride.driverId?.firstName || '').charAt(0)}${(ride.driverInfo?.lastName || ride.driverId?.lastName || '').charAt(0)}`}
                        </span>
                      </div>
                    )}
                    
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        {ride.driverInfo?.firstName || ride.driverId?.firstName} {ride.driverInfo?.lastName || ride.driverId?.lastName}
                      </h4>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm text-gray-600">
                          {ride.driverInfo?.rating || ride.driverId?.rating || '4.8'} Rating
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {(ride.driverInfo?.vehicleModel || ride.driverId?.vehicleModel) && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">VEHICLE DETAILS</h4>
                      <div className="bg-white p-3 rounded-md">
                        <p className="text-sm text-gray-800">
                          <span className="font-medium">{ride.driverInfo?.vehicleModel || ride.driverId?.vehicleModel}</span>
                          {(ride.driverInfo?.vehicleYear || ride.driverId?.vehicleYear) && ` (${ride.driverInfo?.vehicleYear || ride.driverId?.vehicleYear})`}
                        </p>
                        {(ride.driverInfo?.licensePlate || ride.driverId?.licensePlate) && (
                          <p className="text-sm text-gray-600 mt-1">
                            License: {ride.driverInfo?.licensePlate || ride.driverId?.licensePlate}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex flex-col sm:flex-row-reverse sm:justify-between">
              <div className="flex space-x-3 mb-3 sm:mb-0">
                <button
                  onClick={() => navigate('/my-trips')}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  Back
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                <span className="font-medium">Booking ID:</span> {ride._id}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RideDetail; 
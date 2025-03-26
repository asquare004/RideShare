import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

function RideConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { rideDetails, driverDetails } = location.state || {};

  if (!rideDetails || !driverDetails) {
    // Redirect to home if there's no data
    navigate('/');
    return null;
  }

  // Format date for display
  const formatDisplayDate = (dateStr, timeStr) => {
    try {
      const date = new Date(`${dateStr}T${timeStr}`);
      return format(date, 'MMM d, yyyy • h:mm a');
    } catch (error) {
      return `${dateStr} • ${timeStr}`;
    }
  };

  // Format phone number
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    
    // Assuming 10-digit Indian number
    if (phoneNumber.length === 10) {
      return `+91 ${phoneNumber.substring(0, 5)} ${phoneNumber.substring(5)}`;
    }
    
    return phoneNumber;
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-24">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* Success Header */}
          <div className="bg-green-500 px-6 py-4 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white rounded-full p-2 mr-4">
                <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Ride Confirmed!</h2>
                <p className="text-green-100">Your ride has been confirmed with a driver</p>
              </div>
            </div>
          </div>
          
          {/* Driver Info */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Driver Information</h3>
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                {driverDetails.profilePicture ? (
                  <img 
                    src={driverDetails.profilePicture} 
                    alt={`${driverDetails.firstName} ${driverDetails.lastName}`}
                    className="h-16 w-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
                    }}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-xl">
                      {driverDetails.firstName?.[0]}{driverDetails.lastName?.[0]}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {driverDetails.firstName} {driverDetails.lastName}
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="inline-flex items-center mr-3">
                    <svg className="h-4 w-4 mr-1 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {driverDetails.rating?.toFixed(1) || "4.5"}
                  </span>
                  <span>{driverDetails.totalTrips || "10"}+ trips</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs text-gray-500">Vehicle</h4>
                <p className="font-medium text-sm">{driverDetails.vehicleModel} ({driverDetails.vehicleYear})</p>
              </div>
              <div>
                <h4 className="text-xs text-gray-500">License Plate</h4>
                <p className="font-medium text-sm">{driverDetails.licensePlate}</p>
              </div>
              <div>
                <h4 className="text-xs text-gray-500">Phone</h4>
                <p className="font-medium text-sm">{formatPhoneNumber(driverDetails.phoneNumber)}</p>
              </div>
              <div>
                <h4 className="text-xs text-gray-500">Email</h4>
                <p className="font-medium text-sm truncate">{driverDetails.email}</p>
              </div>
            </div>
          </div>
          
          {/* Ride Info */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Ride Details</h3>
            
            <div className="space-y-3">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">From</p>
                  <p className="font-medium">{rideDetails.source}</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">To</p>
                  <p className="font-medium">{rideDetails.destination}</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Departure Time</p>
                  <p className="font-medium">
                    {formatDisplayDate(rideDetails.date, rideDetails.departureTime)}
                  </p>
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
                  <p className="text-xs text-gray-500">Price per Seat</p>
                  <p className="font-medium text-blue-600">₹{rideDetails.price}</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Available Seats</p>
                  <p className="font-medium">{rideDetails.leftSeats || rideDetails.availableSeats || '1'}</p>
                </div>
              </div>
              
              {rideDetails.distance && (
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Distance</p>
                    <p className="font-medium">{rideDetails.distance} km</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 flex">
            <button
              onClick={() => navigate('/my-rides')}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View My Rides
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 ml-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default RideConfirmation; 
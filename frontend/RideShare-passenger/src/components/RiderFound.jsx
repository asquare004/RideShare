import React from 'react';
import { useNavigate } from 'react-router-dom';

const RiderFound = ({ driver, ride }) => {
  const navigate = useNavigate();
  
  // Ensure we have valid driver data
  const driverInfo = driver || {};
  const rideInfo = ride || {};
  
  console.log('RiderFound component received:', { driver: driverInfo, ride: rideInfo });

  const handleViewTrip = () => {
    navigate('/my-trips');
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-24">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-green-50 border-b border-green-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-3 text-xl font-bold text-gray-900">Driver Found!</h2>
              <p className="mt-1 text-sm text-gray-600">
                Your ride has been accepted by a driver
              </p>
            </div>
          </div>

          {/* Driver Details */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Driver Information</h3>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {driverInfo.profilePicture ? (
                  <img 
                    className="h-16 w-16 rounded-full object-cover" 
                    src={driverInfo.profilePicture} 
                    alt={`${driverInfo.firstName || 'Driver'} ${driverInfo.lastName || ''}`} 
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  {driverInfo.firstName || 'Driver'} {driverInfo.lastName || ''}
                </h4>
                <div className="mt-1 flex items-center">
                  <svg className="text-yellow-400 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-sm text-gray-600">
                    {driverInfo.rating ? Number(driverInfo.rating).toFixed(1) : 'New'} • {driverInfo.totalTrips || 0} trips
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle Details if available */}
            {(driverInfo.vehicleModel || ride?.vehicleDetails?.model) && (
              <div className="mt-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Vehicle</p>
                  <p className="text-sm font-medium text-gray-800">
                    {driverInfo.vehicleModel || ride?.vehicleDetails?.model || 'N/A'} {driverInfo.vehicleYear || ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">License Plate</p>
                  <p className="text-sm font-medium text-gray-800">
                    {driverInfo.licensePlate || ride?.vehicleDetails?.licensePlate || 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Ride Details */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Ride Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">From</p>
                  <p className="text-sm font-medium text-gray-800">{rideInfo.source || 'Unknown location'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">To</p>
                  <p className="text-sm font-medium text-gray-800">{rideInfo.destination || 'Unknown destination'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500">Date & Time</p>
                    <p className="text-sm font-medium text-gray-800">
                      {rideInfo.date || 'N/A'} • {rideInfo.departureTime || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <svg className="h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="text-sm font-medium text-blue-600">₹{rideInfo.price || '0'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50">
            <button
              onClick={handleViewTrip}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
            >
              View in My Trips
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full mt-3 py-3 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderFound; 
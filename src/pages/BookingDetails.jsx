import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { rideService } from '../services/rideService';

function BookingDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);
  const { ride, isViewOnly } = location.state || { ride: null, isViewOnly: false };
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Format date with error handling
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date not available';
    }
  };

  // Redirect if no ride data
  useEffect(() => {
    if (!ride) {
      navigate('/');
    }
  }, [ride, navigate]);

  const handleSeatsChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= ride.leftSeats) {
      setSeatsToBook(value);
    }
  };

  const handleSeatSelection = () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    // Prevent booking own ride - with proper null checks
    if (
      (ride.email && currentUser.email && ride.email === currentUser.email) || 
      (ride.createdBy && currentUser._id && 
       (typeof ride.createdBy === 'string' ? 
          ride.createdBy === currentUser._id : 
          ride.createdBy.toString() === currentUser._id.toString()))
    ) {
      setError("You cannot book your own ride");
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleConfirmBooking = async () => {
    try {
      if (!currentUser) {
        setShowLoginModal(true);
        return;
      }

      // We don't need to check for token explicitly since we're using cookie-based auth
      
      // Prevent booking own ride - with proper null checks
      if (
        (ride.email && currentUser.email && ride.email === currentUser.email) || 
        (ride.createdBy && currentUser._id && 
         (typeof ride.createdBy === 'string' ? 
            ride.createdBy === currentUser._id : 
            ride.createdBy.toString() === currentUser._id.toString()))
      ) {
        setError("You cannot book your own ride");
        setShowConfirmation(false);
        return;
      }

      // Add loading state
      setIsLoading(true);

      console.log('Confirming booking for ride:', {
        rideId: ride._id,
        seats: seatsToBook,
        currentUser: {
          _id: currentUser._id,
          email: currentUser.email
        }
      });

      // Use the rideService to join the ride
      await rideService.joinRide(ride._id, seatsToBook);

      // Handle successful booking
      navigate('/', { 
        state: { 
          bookingSuccess: true,
          message: `Successfully booked ${seatsToBook} seat(s) for the ride from ${ride.source} to ${ride.destination}` 
        } 
      });
    } catch (error) {
      console.error('Booking failed:', error);
      
      // Handle authentication errors specifically
      if (error.message && (error.message.includes('Authentication') || 
                           error.message.includes('sign in') || 
                           error.message.includes('token') ||
                           error.message.includes('authenticated'))) {
        setError('Your session may have expired. Please sign in again to continue.');
        setTimeout(() => {
          setShowLoginModal(true);
        }, 1500); // Show login modal after displaying the error message
      } else {
        setError(error.message || 'Failed to book the ride. Please try again.');
      }
      
      setShowConfirmation(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!ride) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 pt-24">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Ride Details Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isViewOnly ? 'Trip Details' : 'Ride Details'}
            </h2>
            <p className="text-sm text-gray-500">
              {isViewOnly 
                ? 'View your trip information'
                : 'Review the details and book your seat'}
            </p>
            {isViewOnly && (
              <div className="mt-2 inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {new Date(ride.date + 'T' + ride.departureTime) > new Date() 
                  ? 'Upcoming Trip' 
                  : 'Completed Trip'}
              </div>
            )}
          </div>

          {/* Trip Route Card */}
          <div className="mb-8 bg-gray-50 p-5 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-800">Trip Route</h3>
              <div className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full">
                {formatDate(ride.date)}
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">A</span>
                </div>
                <div className="h-14 w-0.5 bg-gray-300 my-1"></div>
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xs">B</span>
                </div>
              </div>
              
              <div className="flex-grow">
                <div className="mb-4">
                  <div className="text-sm text-gray-500">From</div>
                  <div className="font-medium text-gray-900">{ride.source}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">To</div>
                  <div className="font-medium text-gray-900">{ride.destination}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ride Details Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Ride Details</h3>
            <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Driver</span>
                <span className="font-medium">{ride.driverName || 'Driver'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Departure Time</span>
                <span className="font-medium">{ride.departureTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {isViewOnly ? 'Seats Booked' : 'Available Seats'}
                </span>
                <span className="font-medium">{ride.leftSeats}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per Seat</span>
                <span className="font-medium text-blue-600">₹{ride.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distance</span>
                <span className="font-medium">{ride.distance || 0} km</span>
              </div>
              {isViewOnly && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Paid</span>
                  <span className="font-medium text-blue-600">₹{ride.price * ride.leftSeats}</span>
                </div>
              )}
            </div>
          </div>

          {/* Book Seats Section - Only show if not in view-only mode */}
          {!isViewOnly && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Book Your Seats</h3>
              <div className="bg-gray-50 p-5 rounded-lg">
                <div className="flex items-center space-x-4 mb-6">
                  <label className="text-gray-600">Number of Seats:</label>
                  <div className="flex items-center">
                    <button 
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      onClick={() => seatsToBook > 1 && setSeatsToBook(seatsToBook - 1)}
                    >
                      <span>-</span>
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={ride.leftSeats}
                      value={seatsToBook}
                      onChange={handleSeatsChange}
                      className="w-16 mx-2 text-center border border-gray-300 rounded-md px-2 py-1"
                    />
                    <button 
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      onClick={() => seatsToBook < ride.leftSeats && setSeatsToBook(seatsToBook + 1)}
                    >
                      <span>+</span>
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price per seat</span>
                    <span className="font-medium">₹{ride.price}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Number of seats</span>
                    <span className="font-medium">x {seatsToBook}</span>
                  </div>
                  <div className="border-t border-gray-200 my-3"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-semibold">Total Price:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{ride.price * seatsToBook}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={() => navigate(isViewOnly ? '/my-trips' : '/')}
              className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {isViewOnly ? 'Back to My Trips' : 'Back to Rides'}
            </button>
            
            {!isViewOnly && (
              <button
                onClick={handleSeatSelection}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Book Now
              </button>
            )}
          </div>

          {/* Display error message */}
          {error && (
            <div className="mt-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Booking</h3>
            <p className="text-gray-600 mb-2">
              You are about to book <span className="font-semibold">{seatsToBook}</span> seat(s) for:
            </p>
            <div className="bg-gray-50 p-3 rounded mb-4">
              <div className="text-sm mb-1"><span className="text-gray-500">From:</span> {ride.source}</div>
              <div className="text-sm mb-1"><span className="text-gray-500">To:</span> {ride.destination}</div>
              <div className="text-sm mb-1"><span className="text-gray-500">Date:</span> {formatDate(ride.date)}</div>
              <div className="text-sm"><span className="text-gray-500">Total:</span> <span className="font-semibold">₹{ride.price * seatsToBook}</span></div>
            </div>
            <p className="text-gray-600 mb-6">Do you want to proceed with this booking?</p>
            <div className="flex space-x-4">
              <button
                onClick={handleConfirmBooking}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Sign in Required</h3>
              <p className="mt-2 text-sm text-gray-500">
                You need to sign in to book this ride. Please sign in to continue.
              </p>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => navigate('/sign-in', { state: { returnTo: location.pathname, rideData: ride } })}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingDetails; 
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function BookingDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ride, isViewOnly } = location.state;
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSeatsChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= ride.availableSeats) {
      setSeatsToBook(value);
    }
  };

  const handleJoinRide = () => {
    setShowConfirmation(true);
  };

  const handleConfirmBooking = async () => {
    try {
      // Add your booking logic here
      navigate('/booking-confirmation'); // Or wherever you want to redirect after successful booking
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 pt-24">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Driver Details Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Driver Details</h2>
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
              <div>
                <h3 className="text-xl font-semibold">{ride.driver.name}</h3>
                <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1">{ride.driver.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ride Details Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Ride Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Car</span>
                <span className="font-medium">Toyota Camry</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available Seats</span>
                <span className="font-medium">{ride.availableSeats}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per Seat</span>
                <span className="font-medium">₹{ride.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">From</span>
                <span className="font-medium">{ride.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To</span>
                <span className="font-medium">{ride.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Departure Time</span>
                <span className="font-medium">{ride.departureTime}</span>
              </div>
            </div>
          </div>

          {/* Only show these sections if not in view-only mode */}
          {!isViewOnly && (
            <>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Book Your Seats</h3>
                <div className="flex items-center space-x-4">
                  <label className="text-gray-600">Number of Seats:</label>
                  <input
                    type="number"
                    min="1"
                    max={ride.availableSeats}
                    value={seatsToBook}
                    onChange={handleSeatsChange}
                    className="w-20 border border-gray-300 rounded-md px-2 py-1"
                  />
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Price:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{ride.price * seatsToBook}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleJoinRide}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Join Ride
              </button>
            </>
          )}

          {/* Add a back button for view-only mode */}
          {isViewOnly && (
            <button
              onClick={() => navigate('/my-trips')}
              className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to My Trips
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Booking</h3>
            <p className="text-gray-600 mb-6">Do you want to book this ride?</p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleConfirmBooking()}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingDetails; 
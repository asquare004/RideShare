import React from 'react';

function RideCard({ ride, onBookRide }) {
  // Format date with error handling
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date not available';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold">{ride.driver.name}</h3>
        <div className="text-gray-600">
          {ride.source} → {ride.destination}
        </div>
        <div className="text-sm text-gray-500">
          {formatDate(ride.date)}
        </div>
        <div className="text-sm text-gray-500">
          {ride.departureTime} | {ride.availableSeats} seats left
        </div>
        <div className="flex items-center mt-2">
          <span className="text-yellow-400">★</span>
          <span className="ml-1">{ride.driver.rating}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-blue-600">
          ₹{ride.price}
          <span className="text-sm font-normal text-gray-600 block">per person</span>
        </div>
        <button 
          onClick={() => onBookRide(ride)}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
        >
          Book Ride
        </button>
      </div>
    </div>
  );
}

export default RideCard;
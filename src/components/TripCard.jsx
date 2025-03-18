import React from 'react';

function TripCard({ trip, onViewDetails, isCompleted }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold">{trip.driver.name}</h3>
        <div className="text-gray-600">
          {trip.from} → {trip.to}
        </div>
        <div className="text-sm text-gray-500">
          {trip.time} | {trip.seats} seats booked
        </div>
        <div className="text-sm text-gray-500">
          {new Date(trip.date).toLocaleDateString()}
        </div>
        <div className="flex items-center mt-2">
          <span className="text-yellow-400">★</span>
          <span className="ml-1">{trip.driver.rating}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-blue-600">
          ₹{trip.price}
          <span className="text-sm font-normal text-gray-600 block">
            {isCompleted ? 'paid' : 'total'}
          </span>
        </div>
        <button 
          onClick={() => onViewDetails(trip)}
          className={`mt-2 px-4 py-2 rounded-full text-white ${
            isCompleted 
              ? 'bg-gray-500 hover:bg-gray-600' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Trip Details
        </button>
      </div>
    </div>
  );
}

export default TripCard; 
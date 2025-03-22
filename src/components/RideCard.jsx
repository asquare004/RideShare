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

  // Text truncation helper
  const truncateText = (text, maxLength = 20) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Get driver info with fallback values for safety
  const driverName = ride.driverName || 'Driver';
  const driverRating = ride.driverRating || '4.5';
  
  // Handle click on Book Ride button
  const handleBookClick = () => {
    console.log('Booking ride:', ride);
    onBookRide(ride);
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center hover:shadow-lg transition-shadow duration-300">
      <div className="flex-grow pr-4">
        <h3 className="text-lg font-semibold text-gray-800">{driverName}</h3>
        
        {/* Source and destination with horizontal arrow */}
        <div className="text-gray-600 mt-2 flex items-center">
          {/* Source location */}
          <div className="flex items-center">
            <div className="w-5 h-5 bg-green-100 rounded-full flex justify-center items-center mr-1">
              <span className="text-green-600 text-xs">A</span>
            </div>
            <span title={ride.source} className="truncate max-w-[120px] inline-block">
              {truncateText(ride.source)}
            </span>
          </div>
          
          {/* Arrow connecting source and destination */}
          <div className="mx-2 flex-shrink-0">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          
          {/* Destination location */}
          <div className="flex items-center">
            <div className="w-5 h-5 bg-red-100 rounded-full flex justify-center items-center mr-1">
              <span className="text-red-600 text-xs">B</span>
            </div>
            <span title={ride.destination} className="truncate max-w-[120px] inline-block">
              {truncateText(ride.destination)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center mt-2">
          <div className="flex items-center text-sm text-gray-500 mr-4">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(ride.date)}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {ride.departureTime}
          </div>
        </div>
        
        <div className="flex items-center mt-2">
          <div className="flex items-center text-sm text-gray-500 mr-4">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {ride.leftSeats} seat{ride.leftSeats !== 1 ? 's' : ''} left
          </div>
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="ml-1 text-sm">{driverRating}</span>
          </div>
        </div>
      </div>
      
      <div className="text-right flex flex-col items-end justify-between">
        <div className="text-2xl font-bold text-blue-600">
          ₹{ride.price || 0}
          <span className="text-sm font-normal text-gray-600 block">per person</span>
        </div>
        <button 
          onClick={handleBookClick}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors duration-300 flex items-center"
          aria-label={`Book ride from ${ride.source} to ${ride.destination}`}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Book Ride
        </button>
      </div>
    </div>
  );
}

export default RideCard;
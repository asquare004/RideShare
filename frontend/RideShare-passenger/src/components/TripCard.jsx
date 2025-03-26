import React from 'react';

function TripCard({ trip, onViewDetails, isCompleted, tripType = 'joined' }) {
  // Text truncation helper
  const truncateText = (text, maxLength = 25) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date not available';
    }
  };

  // Calculate border color based on trip status
  const getBorderColorClass = () => {
    switch(trip.status) {
      case 'completed':
        return 'border-green-500';
      case 'scheduled':
        return 'border-blue-500';
      case 'pending':
        return 'border-yellow-500';
      case 'cancelled':
        return 'border-red-500';
      default:
        return 'border-gray-300';
    }
  };

  const formattedDate = formatDate(trip.date);

  // Add a badge showing trip type 
  const renderTripTypeBadge = () => {
    if (tripType === 'created') {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mr-2">
          You created
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full mr-2">
          You joined
        </span>
      );
    }
  };
  
  // Render status badge
  const renderStatusBadge = () => {
    let bgColor, textColor, label;
    
    switch(trip.status) {
      case 'completed':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        label = 'Completed';
        break;
      case 'scheduled':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        label = 'Scheduled';
        break;
      case 'pending':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        label = 'Pending';
        break;
      case 'cancelled':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        label = 'Cancelled';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        label = 'Unknown';
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium ${bgColor} ${textColor} rounded-full`}>
        {label}
      </span>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 ${getBorderColorClass()}`}>
      <div className="p-4">
        {/* Trip information */}
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold">{trip.driver.name}</h3>
              <div className="ml-2 flex items-center">
                <span className="text-sm text-gray-500">
                  {trip.driver.rating}
                </span>
                <svg className="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {renderTripTypeBadge()}
              {renderStatusBadge()}
            </div>
          </div>
          
          <div className="flex flex-col mb-4">
            <div className="flex items-start mb-2">
              <div className="w-10 flex-shrink-0 flex flex-col items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-0.5 h-8 bg-gray-300"></div>
              </div>
              <div>
                <div className="text-xs text-gray-500">From</div>
                <div className="font-medium">{truncateText(trip.from)}</div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-10 flex-shrink-0 flex justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div>
                <div className="text-xs text-gray-500">To</div>
                <div className="font-medium">{truncateText(trip.to)}</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm border-t pt-3">
            <div className="flex space-x-4">
              <div>
                <span className="text-gray-500">Date: </span>
                <span>{formattedDate}</span>
              </div>
              <div>
                <span className="text-gray-500">Time: </span>
                <span>{trip.time}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-500">₹</span>
              <span className="font-semibold">{trip.price}</span>
            </div>
          </div>
        </div>
        
        {/* View details button */}
        <div className="mt-4">
          <button 
            onClick={() => onViewDetails(trip)} 
            className={`w-full py-2 px-4 rounded-md text-center transition-colors ${
              trip.status === 'cancelled' || trip.status === 'completed' 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            View Trip Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default TripCard; 
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RideCard from '../components/RideCard';
import SearchForm from '../components/SearchForm';
import { rideService } from '../services/rideService';

function RideSearch() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({
    source: '',
    destination: '',
    date: ''
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector(state => state.user);

  // Check for success message from booking
  useEffect(() => {
    if (location.state?.bookingSuccess) {
      setShowSuccessMessage(true);
      setSuccessData({
        message: location.state.message,
        details: location.state.rideDetails
      });
      
      // Clear the location state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
      
      // Auto-hide the success message after 8 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Fetch available rides from the database
  useEffect(() => {
    fetchRides();
  }, [searchParams, currentUser]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      // Use the new getAvailableRides method with search filters
      const availableRides = await rideService.getAvailableRides({
        source: searchParams.source,
        destination: searchParams.destination,
        date: searchParams.date
      });
      
      console.log('Available rides:', availableRides);
      setRides(availableRides || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching rides:', err);
      // Extract the actual error message if available
      const errorMessage = err.message || 'Failed to load rides. Please try again later.';
      setError(errorMessage);
      setRides([]); // Set empty array on error to avoid undefined issues
      setLoading(false);
    }
  };

  const handleBookRide = (ride) => {
    // Navigate to booking details page with ride information
    navigate('/booking-details', { state: { ride } });
  };

  // Handle search form submission
  const handleSearch = (params) => {
    setSearchParams({
      source: params.source || '',
      destination: params.destination || '',
      date: params.date || ''
    });
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="container mx-auto p-4 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {showSuccessMessage && successData && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold">Booking Successful!</p>
                <p>{successData.message}</p>
                
                {successData.details && (
                  <div className="mt-2 p-3 bg-white bg-opacity-50 rounded">
                    <div className="text-sm grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-semibold">Date:</span> {new Date(successData.details.date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-semibold">Time:</span> {successData.details.time}
                      </div>
                      <div>
                        <span className="font-semibold">Seats:</span> {successData.details.seats}
                      </div>
                      <div>
                        <span className="font-semibold">Total:</span> ₹{successData.details.price}
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/my-trips')} 
                      className="mt-2 text-blue-700 hover:text-blue-900 text-sm font-medium flex items-center"
                    >
                      View My Trips
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setShowSuccessMessage(false)}
                className="text-green-700 hover:text-green-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Find a Ride</h2>
            <p className="mt-1 text-sm text-gray-600">
              Search for upcoming rides and book your journey
            </p>
          </div>

          {/* Search Form */}
          <SearchForm onSearch={handleSearch} />

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          {/* Rides List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : rides.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <p className="mt-4 text-lg font-medium">
                {searchParams.date 
                  ? `No rides found for ${new Date(searchParams.date).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}`
                  : "No available rides found matching your criteria"}
              </p>
              <p className="mt-2 text-sm">
                {searchParams.source || searchParams.destination || searchParams.date 
                  ? "Try adjusting your search filters or check back later for new rides."
                  : "There are no rides available that you can join. Rides may be full, already booked by you, or created by you."}
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm text-gray-500">
                Found {rides.length} ride{rides.length !== 1 ? 's' : ''} you can join
              </p>
              <div className="space-y-4">
                {rides.map(ride => (
                  <RideCard
                    key={ride._id}
                    ride={{
                      ...ride,
                      // Format date and time for display
                      formattedDateTime: formatDateTime(ride.date, ride.departureTime)
                    }}
                    onBookRide={handleBookRide}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RideSearch;
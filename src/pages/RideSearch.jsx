import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RideCard from '../components/RideCard';
import SearchForm from '../components/SearchForm';
import { rideService } from '../services/rideService';

function RideSearch() {
  const [rides, setRides] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [filteredRides, setFilteredRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);

  // Helper function to safely compare IDs that may be strings or objects
  const isSameId = (id1, id2) => {
    if (!id1 || !id2) return false;
    
    // Convert both to strings for comparison
    const strId1 = typeof id1 === 'object' ? id1.toString() : id1;
    const strId2 = typeof id2 === 'object' ? id2.toString() : id2;
    
    return strId1 === strId2;
  }

  // Fetch rides from the database
  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
        
        // Get rides
        const ridesData = await rideService.getRides();
        console.log('Original rides data:', ridesData);
        
        // Additional filters
        const availableRides = ridesData.filter(ride => {
          // Filter out rides with no available seats
          if (ride.leftSeats <= 0) {
            console.log(`Filtering out ride ${ride._id} - no seats left`);
            return false;
          }
          
          // Filter out rides created by current user
          if (currentUser && (
            ride.email === currentUser.email || 
            (ride.createdBy && isSameId(ride.createdBy, currentUser._id))
          )) {
            console.log(`Filtering out ride ${ride._id} - created by current user`);
            return false;
          }
          
          // Filter out rides where user is already a passenger
          if (currentUser && ride.passengers && ride.passengers.some(passenger => 
            (passenger.userId && isSameId(passenger.userId, currentUser._id)) ||
            (passenger.email && passenger.email === currentUser.email)
          )) {
            console.log(`Filtering out ride ${ride._id} - user already joined`);
            return false;
          }
          
          return true;
        });
        
        console.log('Filtered rides:', availableRides);
        setRides(availableRides);
        setFilteredRides(availableRides);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching rides:', err);
        setError('Failed to load rides. Please try again later.');
        setLoading(false);
      }
    };

    fetchRides();
  }, [currentUser]);

  // Filter rides based on search criteria
  useEffect(() => {
    let filtered = [...rides];

    if (source) {
      filtered = filtered.filter(ride => 
        ride.source.toLowerCase().includes(source.toLowerCase())
      );
    }

    if (destination) {
      filtered = filtered.filter(ride => 
        ride.destination.toLowerCase().includes(destination.toLowerCase())
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(ride => ride.date === selectedDate);
    }

    setFilteredRides(filtered);
  }, [source, destination, selectedDate, rides]);

  const handleSourceChange = (e) => {
    setSource(e.target.value);
  };

  const handleDestinationChange = (e) => {
    setDestination(e.target.value);
  };

  const handleBookRide = (ride) => {
    // Navigate to booking details page with ride information
    navigate('/booking-details', { state: { ride } });
  };

  // Handle search form submission
  const handleSearch = (params) => {
    setSource(params.source || '');
    setDestination(params.destination || '');
    setSelectedDate(params.date || '');
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
          ) : filteredRides.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <p className="mt-4 text-lg font-medium">
                {selectedDate 
                  ? `No rides found for ${new Date(selectedDate).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}`
                  : "No available rides found matching your criteria"}
              </p>
              <p className="mt-2 text-sm">
                {rides.length === 0 
                  ? "No upcoming rides are currently available. Check back later for new rides."
                  : source || destination || selectedDate 
                    ? "Try adjusting your search filters or check back later for new rides."
                    : "There are no rides available that you can join. Rides may be full, already booked by you, or created by you."}
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm text-gray-500">
                Found {filteredRides.length} ride{filteredRides.length !== 1 ? 's' : ''} you can join
              </p>
              <div className="space-y-4">
                {filteredRides.map(ride => (
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
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth } from '../firebase/config';
import RideCard from '../components/RideCard';
import { useNavigate } from 'react-router-dom';
import SearchForm from '../components/SearchForm';

function RideSearch() {
  const [rides, setRides] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [filteredRides, setFilteredRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const db = getFirestore();
  const navigate = useNavigate();

  // Update the dummy data with 2026 dates
  const dummyRides = [
    {
      id: '1',
      source: 'Mumbai',
      destination: 'Pune',
      departureTime: '09:00 AM',
      date: '2026-03-25',
      availableSeats: 3,
      price: 450,
      driver: {
        name: 'John Doe',
        rating: 4.8
      }
    },
    {
      id: '2',
      source: 'Delhi',
      destination: 'Agra',
      departureTime: '10:30 AM',
      date: '2026-03-26',
      availableSeats: 2,
      price: 550,
      driver: {
        name: 'Jane Smith',
        rating: 4.9
      }
    },
    {
      id: '3',
      source: 'Chicago, IL',
      destination: 'Detroit, MI',
      departureTime: '02:00 PM',
      date: '2026-03-27',
      availableSeats: 4,
      price: 35,
      driver: {
        name: 'Mike Johnson',
        rating: 4.7
      }
    },
    {
      id: '4',
      source: 'Seattle, WA',
      destination: 'Portland, OR',
      departureTime: '11:00 AM',
      date: '2026-03-25',
      availableSeats: 3,
      price: 40,
      driver: {
        name: 'Sarah Wilson',
        rating: 4.6
      }
    },
    {
      id: '5',
      source: 'Miami, FL',
      destination: 'Orlando, FL',
      departureTime: '08:30 AM',
      date: '2026-03-26',
      availableSeats: 2,
      price: 50,
      driver: {
        name: 'David Brown',
        rating: 4.9
      }
    }
  ];

  // Replace the existing useEffect with this one for testing
  useEffect(() => {
    setRides(dummyRides);
    setFilteredRides(dummyRides);
    setLoading(false);
  }, []);

  // Update the filtering logic
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
      // Format selectedDate to match the format in dummyRides (YYYY-MM-DD)
      filtered = filtered.filter(ride => ride.date === selectedDate);
      console.log('Selected Date:', selectedDate); // For debugging
      console.log('Filtered Rides:', filtered); // For debugging
    }

    setFilteredRides(filtered);
  }, [source, destination, selectedDate, rides]);

  // Simplify the source and destination handlers
  const handleSourceChange = (e) => {
    setSource(e.target.value);
  };

  const handleDestinationChange = (e) => {
    setDestination(e.target.value);
  };

  const handleBookRide = (ride) => {
    if (!auth.currentUser) {
      setError('Please sign in to book a ride');
      return;
    }

    // Navigate to booking details page with ride information
    navigate('/booking-details', { state: { ride } });
  };

  // Handle search form submission
  const handleSearch = (params) => {
    console.log('Search Params:', params); // For debugging
    setSource(params.source);
    setDestination(params.destination);
    setSelectedDate(params.date);
  };

  return (
    <div className="container mx-auto p-4 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Find a Ride</h2>
            <p className="mt-1 text-sm text-gray-600">
              Search for available rides and book your journey
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
            <div className="text-center py-4">Loading rides...</div>
          ) : filteredRides.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              {selectedDate 
                ? `No rides found for ${new Date(selectedDate).toLocaleDateString()}`
                : "No rides found matching your criteria"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRides.map(ride => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onBookRide={handleBookRide}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RideSearch;
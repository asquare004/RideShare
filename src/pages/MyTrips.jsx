import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TripCard from '../components/TripCard';
import { rideService } from '../services/rideService';

function MyTrips() {
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [completedRides, setCompletedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [createdRides, setCreatedRides] = useState([]);
  const [joinedRides, setJoinedRides] = useState([]);

  useEffect(() => {
    const fetchUserTrips = async () => {
      if (!currentUser) {
        setShowLoginModal(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get rides from the database
        const userRides = await rideService.getRides({ email: currentUser.email });
        
        // Current date for comparison
        const currentDate = new Date();
        
        // Categorize rides: created by user vs joined by user
        const created = [];
        const joined = [];
        
        userRides.forEach(ride => {
          // Check if user is the creator of the ride
          const isCreator = ride.email === currentUser.email || 
                           (ride.createdBy && 
                            (ride.createdBy === currentUser._id || 
                             ride.createdBy.toString() === currentUser._id.toString()));
          
          // Check if user is a passenger
          const isPassenger = ride.passengers && 
                              ride.passengers.some(p => 
                                (p.email === currentUser.email || 
                                 (p.userId && p.userId.toString() === currentUser._id.toString())) && 
                                p.status === 'confirmed');
          
          // Create a trip object with consistent format
          const tripData = {
            id: ride._id,
            from: ride.source,
            to: ride.destination,
            date: ride.date,
            time: ride.departureTime,
            price: ride.price,
            seats: isCreator ? ride.leftSeats : 
                   (isPassenger ? ride.passengers.find(p => p.email === currentUser.email).bookedSeats : 0),
            distance: ride.distance,
            driver: {
              name: isCreator ? 'You' : (ride.driverName || 'Driver'),
              rating: ride.driverRating || '4.8'
            },
            isCreator: isCreator,
            isPassenger: isPassenger
          };
          
          if (isCreator) {
            created.push(tripData);
          } else if (isPassenger) {
            joined.push(tripData);
          }
        });
        
        setCreatedRides(created);
        setJoinedRides(joined);
        
        // Split rides into upcoming and completed
        const upcoming = [];
        const completed = [];
        
        [...created, ...joined].forEach(trip => {
          const rideDateTime = new Date(`${trip.date}T${trip.time}`);
          
          if (rideDateTime > currentDate) {
            upcoming.push(trip);
          } else {
            completed.push({...trip, status: 'Completed'});
          }
        });
        
        // Sort by date (newest first for upcoming, latest first for completed)
        upcoming.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
        completed.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
        
        setUpcomingRides(upcoming);
        setCompletedRides(completed);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('Failed to load your trips. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserTrips();
  }, [currentUser, navigate]);

  const handleViewDetails = (trip) => {
    const rideData = {
      _id: trip.id,
      source: trip.from,
      destination: trip.to,
      date: trip.date,
      departureTime: trip.time,
      price: trip.price,
      leftSeats: trip.seats,
      distance: trip.distance,
      driverName: trip.driver.name,
      driverRating: trip.driver.rating,
      // Add information about the user's relationship to this ride
      isCreator: trip.isCreator,
      isPassenger: trip.isPassenger
    };
    
    navigate('/booking-details', { 
      state: { 
        ride: rideData,
        isViewOnly: true
      } 
    });
  };

  const handleLogin = () => {
    navigate('/sign-in', { state: { returnTo: '/my-trips' } });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your trips...</p>
      </div>
    );
  }

  if (showLoginModal) {
    return (
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Sign In Required</h2>
              <p className="mt-2 text-gray-600">
                You need to sign in to view your trips and booking history
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-800">Why sign in?</h3>
                  <div className="mt-1 text-sm text-gray-600">
                    <p>Signing in allows you to:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>View your upcoming and past trips</li>
                      <li>Manage your bookings</li>
                      <li>Access your ride history</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={handleLogin}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalCreated = createdRides.length;
  const totalJoined = joinedRides.length;

  return (
    <div className="container mx-auto px-4 pt-24">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">My Trips</h1>
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-blue-50 rounded-lg px-3 py-1 text-sm">
          <span className="font-medium text-blue-700">{totalCreated}</span> 
          <span className="text-blue-600"> rides created</span>
        </div>
        <div className="bg-green-50 rounded-lg px-3 py-1 text-sm">
          <span className="font-medium text-green-700">{totalJoined}</span> 
          <span className="text-green-600"> rides joined</span>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Upcoming Rides Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-700">Upcoming Rides</h2>
          <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full">
            {upcomingRides.length} rides
          </span>
        </div>
        <div className="space-y-4">
          {upcomingRides.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <p className="mt-4 text-lg font-medium">No upcoming rides</p>
              <p className="mt-2 text-sm">You don't have any upcoming rides. Book a ride now!</p>
              <button 
                onClick={() => navigate('/')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Find a Ride
              </button>
            </div>
          ) : (
            upcomingRides.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onViewDetails={handleViewDetails}
                isCompleted={false}
                tripType={trip.isCreator ? 'created' : 'joined'}
              />
            ))
          )}
        </div>
      </div>

      {/* Completed Rides Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-700">Ride History</h2>
          <span className="text-sm bg-green-100 text-green-800 py-1 px-3 rounded-full">
            {completedRides.length} rides
          </span>
        </div>
        <div className="space-y-4">
          {completedRides.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-lg font-medium">No ride history yet</p>
              <p className="mt-2 text-sm">Your completed rides will appear here.</p>
            </div>
          ) : (
            completedRides.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onViewDetails={handleViewDetails}
                isCompleted={true}
                tripType={trip.isCreator ? 'created' : 'joined'}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyTrips; 
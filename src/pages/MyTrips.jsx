import React from 'react';
import { useNavigate } from 'react-router-dom';
import TripCard from '../components/TripCard';

function MyTrips() {
  const navigate = useNavigate();

  // Example data with more entries
  const upcomingRides = [
    {
      id: 1,
      from: "Mumbai",
      to: "Pune",
      date: "2024-03-25",
      time: "09:00 AM",
      price: 450,
      seats: 2,
      driver: {
        name: "John Doe",
        rating: 4.8
      }
    },
    {
      id: 2,
      from: "Delhi",
      to: "Agra",
      date: "2024-03-26",
      time: "10:30 AM",
      price: 350,
      seats: 1,
      driver: {
        name: "Mike Smith",
        rating: 4.7
      }
    }
  ];

  const completedRides = [
    {
      id: 3,
      from: "Bangalore",
      to: "Mysore",
      date: "2024-03-10",
      time: "02:00 PM",
      price: 400,
      seats: 2,
      status: "Completed",
      driver: {
        name: "Jane Smith",
        rating: 4.9
      }
    },
    {
      id: 4,
      from: "Chennai",
      to: "Pondicherry",
      date: "2024-03-08",
      time: "11:00 AM",
      price: 380,
      seats: 1,
      status: "Completed",
      driver: {
        name: "David Wilson",
        rating: 4.6
      }
    }
  ];

  const handleViewDetails = (trip) => {
    const rideData = {
      id: trip.id,
      source: trip.from,
      destination: trip.to,
      departureTime: trip.time,
      price: trip.price,
      availableSeats: trip.seats,
      driver: trip.driver
    };
    
    navigate('/booking-details', { 
      state: { 
        ride: rideData,
        isViewOnly: true
      } 
    });
  };

  return (
    <div className="container mx-auto px-4 pt-24">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">My Trips</h1>
      
      {/* Upcoming Rides Section */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-gray-700 mb-4">Upcoming Rides</h2>
        <div className="space-y-4">
          {upcomingRides.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No upcoming rides</p>
          ) : (
            upcomingRides.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onViewDetails={handleViewDetails}
                isCompleted={false}
              />
            ))
          )}
        </div>
      </div>

      {/* Completed Rides Section */}
      <div>
        <h2 className="text-xl font-medium text-gray-700 mb-4">Completed Rides</h2>
        <div className="space-y-4">
          {completedRides.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No completed rides</p>
          ) : (
            completedRides.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onViewDetails={handleViewDetails}
                isCompleted={true}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyTrips; 
import React from 'react';

function MyTrips() {
  // Example data - replace with your actual data from backend
  const upcomingRides = [
    {
      id: 1,
      from: "San Francisco",
      to: "Los Angeles",
      date: "2024-03-25",
      time: "09:00 AM",
      price: 45,
      driver: "John Doe",
      seats: 2
    },
    // Add more upcoming rides
  ];

  const completedRides = [
    {
      id: 2,
      from: "Los Angeles",
      to: "San Diego",
      date: "2024-03-10",
      time: "02:00 PM",
      price: 35,
      driver: "Jane Smith",
      status: "Completed"
    },
    // Add more completed rides
  ];

  return (
    <div className="container mx-auto px-4 pt-24">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">My Trips</h1>
      
      {/* Upcoming Rides Section */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-gray-700 mb-4">Upcoming Rides</h2>
        <div className="space-y-4">
          {upcomingRides.map((ride) => (
            <div key={ride.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">
                    {ride.from} → {ride.to}
                  </h3>
                  <p className="text-gray-600">
                    {new Date(ride.date).toLocaleDateString()} at {ride.time}
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  ${ride.price}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <p>Driver: {ride.driver}</p>
                <p>Seats booked: {ride.seats}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Rides Section */}
      <div>
        <h2 className="text-xl font-medium text-gray-700 mb-4">Completed Rides</h2>
        <div className="space-y-4">
          {completedRides.map((ride) => (
            <div key={ride.id} className="bg-gray-50 rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">
                    {ride.from} → {ride.to}
                  </h3>
                  <p className="text-gray-600">
                    {new Date(ride.date).toLocaleDateString()} at {ride.time}
                  </p>
                </div>
                <div className="text-right">
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    ${ride.price}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">Completed</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Driver: {ride.driver}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyTrips; 
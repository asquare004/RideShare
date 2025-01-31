import React, { useContext, useState } from 'react';
import { RideContext } from '../context/RideContext';




function RideSearch() {
  const { rides } = useContext(RideContext);
  const [searchParams, setSearchParams] = useState({
    source: '',
    destination: '',
    rating: '',
    maxPrice: '',
    date: '', 
  });

  function formatDate(dateString) {
    const date = new Date(dateString);
  
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  const filteredRides = rides.filter(ride => 
    (!searchParams.source || ride.source.toLowerCase().includes(searchParams.source.toLowerCase())) &&
    (!searchParams.destination || ride.destination.toLowerCase().includes(searchParams.destination.toLowerCase())) &&
    (!searchParams.maxPrice || ride.price <= parseFloat(searchParams.maxPrice)) &&
    (!searchParams.rating || ride.driver.rating <= parseFloat(searchParams.rating)) &&
    (!searchParams.date || ride.date === searchParams.date) 
  );


  return (
    <div className="space-y-6 mt-24">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Find Your Ride</h2>
        <div className="grid grid-cols-3 gap-4">
          <input 
            type="text" 
            placeholder="From" 
            value={searchParams.source}
            onChange={(e) => setSearchParams({...searchParams, source: e.target.value})}
            className="border p-2 rounded"
          />
          <input 
            type="text" 
            placeholder="To" 
            value={searchParams.destination}
            onChange={(e) => setSearchParams({...searchParams, destination: e.target.value})}
            className="border p-2 rounded"
          />
          <input 
            type="date" 
            value={searchParams.date}
            onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
            className="border p-2 rounded"
          />
          <input 
            type="number" 
            placeholder="Max Price" 
            value={searchParams.maxPrice}
            onChange={(e) => setSearchParams({...searchParams, maxPrice: e.target.value})}
            className="border p-2 rounded"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredRides.map(ride => (
          <div 
            key={ride.id} 
            className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-semibold">{ride.driver.name}</h3> 
              <div className="text-gray-600">
                {ride.source} → {ride.destination}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(ride.date)} | {ride.departureTime} | {ride.availableSeats} seats left | ⭐ {ride.driver.rating}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">${ride.price}</div>
              <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-full" onClick={()=>{setCurrentPage('book-ride')}}>
                Book Ride
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RideSearch;
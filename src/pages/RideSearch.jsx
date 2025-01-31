import React, { useContext, useState } from 'react';
import { RideContext } from '../context/RideContext';
import Map from '../components/Map';
import ClientOnly from '../components/ClientOnly';

function RideSearch() {
  const { rides } = useContext(RideContext);
  const [searchParams, setSearchParams] = useState({
    source: null,
    destination: null,
    maxPrice: '',
    date: '',
  });

  const [markers, setMarkers] = useState({
    source: null,
    destination: null
  });

  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;
    
    if (!markers.source) {
      setMarkers(prev => ({
        ...prev,
        source: { lat, lng }
      }));
      setSearchParams(prev => ({
        ...prev,
        source: `${lat},${lng}`
      }));
    } else if (!markers.destination) {
      setMarkers(prev => ({
        ...prev,
        destination: { lat, lng }
      }));
      setSearchParams(prev => ({
        ...prev,
        destination: `${lat},${lng}`
      }));
    }
  };

  const resetMarkers = () => {
    setMarkers({ source: null, destination: null });
    setSearchParams(prev => ({
      ...prev,
      source: null,
      destination: null
    }));
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
  
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  const filteredRides = rides.filter(ride => 
    (!searchParams.maxPrice || ride.price <= parseFloat(searchParams.maxPrice)) &&
    (!searchParams.date || ride.date === searchParams.date)
  );

  return (
    <div className="flex gap-6 mt-24 px-6">
      <div className="w-1/2">
        <div className="bg-white shadow-md rounded-lg p-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Select Route on Map</h2>
            <button 
              onClick={resetMarkers}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Reset Markers
            </button>
          </div>
          
          <ClientOnly>
            <Map markers={markers} handleMapClick={handleMapClick} />
          </ClientOnly>
          
          <div className="mt-2 text-sm text-gray-600">
            {!markers.source && !markers.destination && "Click on the map to set source location"}
            {markers.source && !markers.destination && "Click on the map to set destination"}
            {markers.source && markers.destination && "Route selected!"}
          </div>
        </div>
      </div>

      <div className="w-1/2 space-y-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Find Your Ride</h2>
          <div className="grid grid-cols-2 gap-4">
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
                <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-full">
                  Book Ride
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RideSearch;
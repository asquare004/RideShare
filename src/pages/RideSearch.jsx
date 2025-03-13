import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import LocationInput from '../components/LocationInput';

function RideSearch() {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    sourceCord: '',
    destinationCord: '',
  });

  const [markers, setMarkers] = useState({
    sourceCord: null,
    destinationCord: null
  });

  const handleGetLocation = async () => {
    const userWantsToShare = window.confirm(
      'Would you like to share your location to help set your ride details?\n\nThis will help accurately mark your position on the map.'
    );

    if (!userWantsToShare) {
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'denied') {
        alert('Please enable location access in your browser settings.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting current location:", error);
          alert('Unable to get your location. Please try again.');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error("Error checking location permission:", error);
      alert('Unable to access location services.');
    }
  };

  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;
    
    const reverseGeocode = async (lat, lng, type) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        
        if (type === 'source') {
          setFormData(prev => ({
            ...prev,
            source: data.display_name,
            sourceCord: `${lat},${lng}`
          }));
          setMarkers(prev => ({
            ...prev,
            sourceCord: { lat, lng }
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            destination: data.display_name,
            destinationCord: `${lat},${lng}`
          }));
          setMarkers(prev => ({
            ...prev,
            destinationCord: { lat, lng }
          }));
        }
      } catch (error) {
        console.error('Error in reverse geocoding:', error);
      }
    };

    if (!markers.sourceCord) {
      reverseGeocode(lat, lng, 'source');
    } else if (!markers.destinationCord) {
      reverseGeocode(lat, lng, 'destination');
    }
  };

  const resetMarkers = () => {
    setMarkers({ sourceCord: null, destinationCord: null });
    setFormData(prev => ({
      ...prev,
      source: '',
      destination: '',
      sourceCord: '',
      destinationCord: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Searching for rides:', formData);
    // Implement search logic here
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Search for a Ride</h2>
            <p className="mt-1 text-sm text-gray-600">
              Find a ride that matches your schedule and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow-md rounded-lg p-4">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">Route on Map</h3>
                <button 
                  onClick={resetMarkers}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Reset Markers
                </button>
              </div>
              
              <Map 
                markers={markers} 
                handleMapClick={handleMapClick}
                currentLocation={currentLocation}
                onLocationRequest={handleGetLocation}
              />
              
              <div className="mt-2 text-sm text-gray-600">
                {!markers.sourceCord && !markers.destinationCord && "Click on the map to set source"}
                {markers.sourceCord && !markers.destinationCord && "Click on the map to set destination"}
                {markers.sourceCord && markers.destinationCord && "Route selected!"}
              </div>
            </div>

            {/* Form Section - Right Side */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Source Location</label>
                  <LocationInput
                    placeholder="Enter source location"
                    value={formData.source}
                    onChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
                    onLocationSelect={(location) => {
                      setFormData(prev => ({
                        ...prev,
                        source: location.name,
                        sourceCord: `${location.coordinates.lat},${location.coordinates.lng}`
                      }));
                      setMarkers(prev => ({
                        ...prev,
                        sourceCord: location.coordinates
                      }));
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Destination Location</label>
                  <LocationInput
                    placeholder="Enter destination location"
                    value={formData.destination}
                    onChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}
                    onLocationSelect={(location) => {
                      setFormData(prev => ({
                        ...prev,
                        destination: location.name,
                        destinationCord: `${location.coordinates.lat},${location.coordinates.lng}`
                      }));
                      setMarkers(prev => ({
                        ...prev,
                        destinationCord: location.coordinates
                      }));
                    }}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Search Rides
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RideSearch;
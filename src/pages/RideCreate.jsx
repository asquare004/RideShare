import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import LocationInput from '../components/LocationInput';
import { useRideForm } from '../hooks/useRideForm';
import { locationService } from '../services/locationService';
import { RIDE_CONSTANTS, INITIAL_MARKERS_STATE, DEFAULT_CENTER } from '../constants/ride';

function RideCreate() {
  const navigate = useNavigate();
  const { formData, setFormData, error, handleChange } = useRideForm();
  const [markers, setMarkers] = useState(INITIAL_MARKERS_STATE);
  const [distance, setDistance] = useState(null);
  const [fareRange, setFareRange] = useState({ min: 0, max: 0 });
  const [mapCenter, setMapCenter] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState(null);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      });

      const { latitude: lat, longitude: lng } = position.coords;
      const locationData = await locationService.reverseGeocode(lat, lng);
      
      // Ensure precise coordinates are used for centering
      const exactCenter = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      };
      
      setMapCenter(exactCenter);
      
      handleLocationSelect({
        name: locationData.display_name,
        coordinates: exactCenter
      }, 'source');

    } catch (error) {
      console.error('Geolocation error:', error);
      setLocationError(
        error.code === 1 ? 'Please enable location permissions' :
        error.code === 2 ? 'Location unavailable' :
        error.code === 3 ? 'Location request timed out' :
        'Error getting your location'
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      getCurrentLocation();
    } else {
      setLocationError('Geolocation is not supported by your browser');
      setIsLoadingLocation(false);
      setMapCenter(DEFAULT_CENTER);
    }
  }, []);

  const handleGetLocationClick = () => {
    getCurrentLocation();
  };

  const updateFareRange = (distance) => {
    const minFare = Math.ceil(RIDE_CONSTANTS.MIN_FARE_MULTIPLIER * distance);
    const maxFare = Math.ceil(RIDE_CONSTANTS.MAX_FARE_MULTIPLIER * distance);
    setFareRange({ min: minFare, max: maxFare });
  };

  const handleLocationSelect = async (location, type) => {
    const coordinates = `${location.coordinates.lat},${location.coordinates.lng}`;
    const markerKey = type === 'source' ? 'sourceCord' : 'destinationCord';
    const locationKey = type === 'source' ? 'source' : 'destination';

    // Ensure precise coordinates
    const exactCoordinates = {
      lat: parseFloat(location.coordinates.lat),
      lng: parseFloat(location.coordinates.lng)
    };

    setFormData(prev => ({
      ...prev,
      [locationKey]: location.name,
      [`${locationKey}Cord`]: coordinates
    }));

    setMarkers(prev => ({
      ...prev,
      [markerKey]: exactCoordinates
    }));

    // Set exact center
    setMapCenter(exactCoordinates);

    if (type === 'source' && formData.destinationCord) {
      const distance = await locationService.calculateDistance(coordinates, formData.destinationCord);
      setDistance(distance);
      updateFareRange(distance);
    } else if (type === 'destination' && formData.sourceCord) {
      const distance = await locationService.calculateDistance(formData.sourceCord, coordinates);
      setDistance(distance);
      updateFareRange(distance);
    }
  };

  const handleMapClick = async (event) => {
    const { lat, lng } = event.latlng;
    const type = !markers.sourceCord ? 'source' : 'destination';
    
    try {
      const data = await locationService.reverseGeocode(lat, lng);
      handleLocationSelect({ 
        name: data.display_name, 
        coordinates: { lat, lng } 
      }, type);
    } catch (error) {
      console.error('Error handling map click:', error);
    }
  };

  const handleResetMarkers = () => {
    setMarkers(INITIAL_MARKERS_STATE);
    setFormData(prev => ({
      ...prev,
      source: '',
      destination: '',
      sourceCord: '',
      destinationCord: ''
    }));
    setDistance(null);
    setFareRange({ min: 0, max: 0 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form validation here
    console.log('Form submitted:', formData);
    navigate('/find-driver');
  };

  const handlePassengerInput = (e) => {
    const { value } = e.target;
    
    // Allow empty value for clearing the input
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        availableSeats: ''
      }));
      setError('');
      return;
    }

    const numValue = parseInt(value);
    
    // Check if it's a valid number and within range
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 6) {
      setFormData(prev => ({
        ...prev,
        availableSeats: value
      }));
      setError('');
    } else if (numValue > 6) {
      setError('One car can have maximum 6 passengers');
      setFormData(prev => ({
        ...prev,
        availableSeats: '6'
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Publish a New Ride</h2>
            <p className="mt-1 text-sm text-gray-600">
              Share your journey with others and split the costs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map Section - Left Side */}
            <div className="bg-white shadow-md rounded-lg p-4">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Route on Map</h3>
                <button
                  onClick={handleGetLocationClick}
                  className="px-4 py-2 text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium shadow-sm"
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? 'Getting location...' : 'Current Location'}
                </button>
              </div>
              
              {locationError && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                  {locationError}
                </div>
              )}

              <Map 
                markers={markers} 
                handleMapClick={handleMapClick}
                currentLocation={markers.currentLocation}
                center={mapCenter}
                onReset={handleResetMarkers}
              />
            </div>

            {/* Form Section - Right Side */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Location Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Source Location</label>
                    <LocationInput
                      placeholder="Enter source location"
                      value={formData.source}
                      onChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
                      onLocationSelect={(location) => handleLocationSelect(location, 'source')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Destination Location</label>
                    <LocationInput
                      placeholder="Enter destination location"
                      value={formData.destination}
                      onChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}
                      onLocationSelect={(location) => handleLocationSelect(location, 'destination')}
                    />
                  </div>
                </div>

                {distance && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Estimated Distance:
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {distance} km
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Suggested Fare Range:
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        ₹{fareRange.min} - ₹{fareRange.max}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Departure Time</label>
                  <input
                    type="time"
                    name="departureTime"
                    value={formData.departureTime}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">No of Passengers</label>
                  <input
                    type="number"
                    name="availableSeats"
                    value={formData.availableSeats}
                    onChange={handlePassengerInput}
                    onKeyDown={(e) => {
                      // Prevent the up arrow from incrementing beyond 6
                      if (e.key === 'ArrowUp' && parseInt(formData.availableSeats) >= 6) {
                        e.preventDefault();
                        setError('One car can have maximum 6 passengers');
                      }
                      // Allow backspace and delete
                      if (e.key === 'Backspace' || e.key === 'Delete') {
                        setError('');
                      }
                    }}
                    min="1"
                    max="6"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  {error && (
                    <p className="mt-1 text-sm text-red-600">
                      {error}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price per Seat</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    // Only apply min/max constraints when we have a valid distance
                    {...(distance ? {
                      min: fareRange.min,
                      max: fareRange.max
                    } : { min: "0" })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  {distance && (
                    <p className="mt-1 text-sm text-gray-500">
                      Suggested price range: ₹{fareRange.min} - ₹{fareRange.max}
                    </p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Publish Ride
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RideCreate;
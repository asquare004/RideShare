import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Map from '../components/Map';
import LocationInput from '../components/LocationInput';
import { useRideForm } from '../hooks/useRideForm';
import { locationService } from '../services/locationService';
import { rideService } from '../services/rideService';
import { RIDE_CONSTANTS, INITIAL_MARKERS_STATE, DEFAULT_CENTER } from '../constants/ride';

// Custom styles to fix z-index issues
const mapStyles = `
  .leaflet-map-pane, 
  .leaflet-marker-pane, 
  .leaflet-popup-pane, 
  .leaflet-overlay-pane, 
  .leaflet-shadow-pane, 
  .leaflet-tile-pane {
    z-index: 5 !important;
  }
  
  .leaflet-control {
    z-index: 10 !important;
  }
`;

function RideCreate() {
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);
  const { formData, setFormData, error, setError, handleChange } = useRideForm();
  const [markers, setMarkers] = useState(INITIAL_MARKERS_STATE);
  const [distance, setDistance] = useState(null);
  const [fareRange, setFareRange] = useState({ min: 0, max: 0 });
  const [mapCenter, setMapCenter] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
    
    // Add debugging for authentication
    console.log('Current user:', currentUser);
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

  // Add function to get min time (if today is selected, only allow future times)
  const getMinTime = () => {
    if (formData.date === new Date().toISOString().split('T')[0]) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return null; // No min time for future dates
  };

  // Validate date and time
  const validateDateTime = (date, time) => {
    const selectedDateTime = new Date(`${date}T${time}:00`);
    const currentDateTime = new Date();
    
    if (selectedDateTime <= currentDateTime) {
      const formattedCurrent = currentDateTime.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
      return `Departure must be after ${formattedCurrent}`;
    }
    return null;
  };

  // Handle date change with validation
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setFormData(prev => ({
      ...prev,
      date: newDate
    }));
    
    // If time is also set, validate the combination
    if (formData.departureTime) {
      const error = validateDateTime(newDate, formData.departureTime);
      setError(error);
    }
  };

  // Handle time change with validation
  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setFormData(prev => ({
      ...prev,
      departureTime: newTime
    }));
    
    // If date is also set, validate the combination
    if (formData.date) {
      const error = validateDateTime(formData.date, newTime);
      setError(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form data
      if (!formData.source || !formData.sourceCord) {
        setError('Please select a source location');
        setIsSubmitting(false);
        return;
      }

      if (!formData.destination || !formData.destinationCord) {
        setError('Please select a destination location');
        setIsSubmitting(false);
        return;
      }

      // Validate date and time
      const dateTimeError = validateDateTime(formData.date, formData.departureTime);
      if (dateTimeError) {
        setError(dateTimeError);
        setIsSubmitting(false);
        return;
      }

      // Calculate left passengers (4 - selected passengers)
      const totalPassengers = parseInt(formData.availableSeats);
      const leftSeats = 4 - totalPassengers;

      // Validate if the number of passengers is valid
      if (leftSeats < 0) {
        setError('Maximum 4 passengers are allowed');
        setIsSubmitting(false);
        return;
      }

      // Check if user is logged in - if not, show login modal
      if (!currentUser) {
        setShowLoginModal(true);
        setIsSubmitting(false);
        return;
      }

      // Debug authentication state
      console.log('Attempting to create ride with user:', currentUser);
      
      if (!currentUser._id) {
        console.error('User ID is missing from currentUser object');
        setError('Authentication error: User ID is missing. Please try signing out and back in.');
        setIsSubmitting(false);
        return;
      }
      
      // Check if token is available
      if (!currentUser.token) {
        console.warn('Token may be missing from currentUser object');
        // We'll still try to create the ride since we've added the interceptor and backend also checks cookies
      }
      
      // Prepare ride data according to backend requirements
      const rideData = {
        source: formData.source,
        sourceCord: formData.sourceCord,
        destination: formData.destination,
        destinationCord: formData.destinationCord,
        leftSeats: leftSeats, // Using leftSeats instead of leftPassengers to match backend model
        date: formData.date,
        departureTime: formData.departureTime,
        price: parseInt(formData.price),
        distance: distance,
        email: currentUser.email, // Required by backend
        driverId: currentUser._id || '', // Use empty string as fallback
        maxSeats: leftSeats, // Add the maxSeats field with the same value as leftSeats
        createdBy: currentUser._id // Add createdBy field with the current user's ID
      };

      console.log('Sending ride data:', rideData);
      console.log('Current cookies:', document.cookie);

      // Create ride in database
      await rideService.createRide(rideData);
      
      // Navigate to mytrips page instead of ride search page
      navigate('/my-trips');
    } catch (error) {
      console.error('Error creating ride:', error);
      
      // Handle authentication errors specifically
      if (error.message && (
          error.message.includes('not authenticated') || 
          error.message.includes('token') || 
          error.message.includes('auth'))) {
        setError('Authentication error: Please sign out and sign in again to create a ride.');
      } 
      // Handle database timeout errors
      else if (error.message && (
          error.message.includes('timed out') || 
          error.message.includes('timeout') ||
          error.message.includes('connect to the database'))) {
        setError('Database connection error: The server is taking too long to respond. Please try again in a few minutes.');
      }
      else {
        setError(error.message || 'Failed to create ride. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
    
    // Check if it's a valid number and within range (max 4 passengers)
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 4) {
      setFormData(prev => ({
        ...prev,
        availableSeats: value
      }));
      setError('');
    } else if (numValue > 4) {
      setError('Maximum 4 passengers are allowed');
      setFormData(prev => ({
        ...prev,
        availableSeats: '4'
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-24">
      {/* Add styles to fix z-index issues */}
      <style>{mapStyles}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Publish a New Ride</h2>
            <p className="mt-1 text-sm text-gray-600">
              Share your journey with others and split the costs
              {!currentUser && <span className="ml-1 text-blue-600 font-medium"> • You'll need to sign in before publishing</span>}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map Section - Left Side */}
            <div className="bg-white shadow-md rounded-lg p-4 relative" style={{ zIndex: 10 }}>
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
                    onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]} // Set min to today's date
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
                    onChange={handleTimeChange}
                    min={formData.date === new Date().toISOString().split('T')[0] ? getMinTime() : null}
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
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Publishing ride...</span>
                      </div>
                    ) : (
                      "Publish Ride"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Login Modal */}
          {showLoginModal && (
            <div className="fixed inset-0 overflow-y-auto h-full w-full" style={{ zIndex: 50000 }}>
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50" style={{ zIndex: 50000 }}></div>
              <div className="flex items-center justify-center min-h-screen">
                <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white mx-auto" style={{ zIndex: 50001 }}>
                  <div className="mt-3 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                      <svg 
                        className="h-6 w-6 text-blue-600" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Sign in to publish your ride</h3>
                    <div className="mt-2 px-7 py-3">
                      <p className="text-sm text-gray-500">
                         Sign in to complete the process and share your journey with others.
                      </p>
                    </div>
                    <div className="items-center px-4 py-3">
                      <button
                        onClick={() => navigate('/sign-in')}
                        className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => setShowLoginModal(false)}
                        className="ml-3 px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Display error message if any */}
          {error && (
            <div className="mt-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RideCreate;
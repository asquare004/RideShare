import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';

function RideCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    date: '',
    departureTime: '',
    availableSeats: '',
    price: '',
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
      setFormData(prev => ({
        ...prev,
        source: `${lat},${lng}`
      }));
    } else if (!markers.destination) {
      setMarkers(prev => ({
        ...prev,
        destination: { lat, lng }
      }));
      setFormData(prev => ({
        ...prev,
        destination: `${lat},${lng}`
      }));
    }
  };

  const resetMarkers = () => {
    setMarkers({ source: null, destination: null });
    setFormData(prev => ({
      ...prev,
      source: '',
      destination: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    navigate('/');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Map Section */}
            <div className="bg-white shadow-md rounded-lg p-4">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">Select Route on Map</h3>
                <button 
                  onClick={resetMarkers}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Reset Markers
                </button>
              </div>
              
              <Map markers={markers} handleMapClick={handleMapClick} />
              
              <div className="mt-2 text-sm text-gray-600">
                {!markers.source && !markers.destination && "Click on the map to set source location"}
                {markers.source && !markers.destination && "Click on the map to set destination"}
                {markers.source && markers.destination && "Route selected!"}
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <label className="block text-sm font-medium text-gray-700">Available Seats</label>
                <input
                  type="number"
                  name="availableSeats"
                  value={formData.availableSeats}
                  onChange={handleChange}
                  min="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price per Seat</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
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
  );
}

export default RideCreate;
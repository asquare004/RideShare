import React, { useContext, useState } from 'react';
import { RideContext } from '../context/RideContext';
function RideCreate() {
  const { addRide } = useContext(RideContext);
  const [rideDetails, setRideDetails] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    addRide({
      driver: { name: 'Current User', rating: 4.5 },
      ...rideDetails
    });
    // Redirect to proposals page
    
    // You might want to use a proper router instead of this approach
    // setCurrentPage('proposals');
  };

  
  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 mt-24">
      <h2 className="text-2xl font-semibold mb-6 text-center">Create a Ride</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" 
          placeholder="Source" 
          value={rideDetails.source}
          onChange={(e) => setRideDetails({...rideDetails, source: e.target.value})}
          className="w-full border p-2 rounded"
          required
        />
        <input 
          type="text" 
          placeholder="Destination" 
          value={rideDetails.destination}
          onChange={(e) => setRideDetails({...rideDetails, destination: e.target.value})}
          className="w-full border p-2 rounded"
          required
        />
            <input 
        type="datetime-local" 
        value={rideDetails.departureTime}
        onChange={(e) => { 
          console.log(e);
          let str = e.target.value;
          str = str.slice(0, 10); 
          setRideDetails({ ...rideDetails, departureTime: e.target.value, date: str }); 
        }}
        className="w-full border p-2 rounded"
        required
      />
        <select 
          value={rideDetails.carType}
          onChange={(e) => setRideDetails({...rideDetails, carType: e.target.value})}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Car Type</option>
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="Hatchback">Hatchback</option>
        </select>
        <input 
          type="number" 
          placeholder="Available Seats" 
          value={rideDetails.availableSeats}
          onChange={(e) => setRideDetails({...rideDetails, availableSeats: parseInt(e.target.value)})}
          min="1" 
          max="6"
          className="w-full border p-2 rounded"
          required
        />
        <input 
          type="number" 
          placeholder="Price per Person" 
          value={rideDetails.price}
          onChange={(e) => setRideDetails({...rideDetails, price: parseFloat(e.target.value)})}
          min="0"
          step="0.01"
          className="w-full border p-2 rounded"
          required
        />
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700"
        >
          Create Ride
        </button>
      </form>
    </div>
  );
}

export default RideCreate;
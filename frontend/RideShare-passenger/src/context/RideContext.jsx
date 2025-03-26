import React, { createContext, useState } from 'react';

export const RideContext = createContext();

export const RideProvider = ({ children }) => {
  const [rides, setRides] = useState([
    {
      id: 1,
      driver: { name: 'John Doe', rating: 4.5 },
      source: 'Downtown',
      destination: 'Suburb',
      departureTime: '14:30',
      date: "2025-01-12",
      availableSeats: 2,
      price: 15
    }
  ]);
 
  const addRide = (newRide) => {
    
    setRides([...rides, { ...newRide, id: rides.length + 1 }]);
  };

  return (
    <RideContext.Provider value={{ rides, addRide }}>
      {children}
    </RideContext.Provider>
  );
};
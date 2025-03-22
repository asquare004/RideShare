import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function FindDriver() {
  const [timeLeft, setTimeLeft] = useState(60);
  const [driverAccepted, setDriverAccepted] = useState(false);
  const [acceptedDriver, setAcceptedDriver] = useState(null);
  const [proposals, setProposals] = useState([
    // Dummy data - replace with actual API data
    {
      id: 1,
      driverName: "John Doe",
      carName: "Toyota Camry",
      rating: 4.8,
      pricePerPerson: 25,
      totalPrice: 75,
    },
    {
      id: 2,
      driverName: "Jane Smith",
      carName: "Honda Civic",
      rating: 4.5,
      pricePerPerson: 22,
      totalPrice: 66,
    }
  ]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !driverAccepted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, driverAccepted]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAccept = (proposal) => {
    setDriverAccepted(true);
    setAcceptedDriver(proposal);
    setShowSuccessModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 pt-24">
      <div className="text-center mb-8">
        {!driverAccepted && timeLeft > 0 && (
          <div className="flex flex-col items-center mt-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Searching for drivers...</p>
            <div className="text-3xl font-bold text-blue-600 mt-4">
              {formatTime(timeLeft)}
            </div>
          </div>
        )}
        
        {(timeLeft === 0 || (!driverAccepted && proposals.length === 0)) && (
          <div className="bg-yellow-100 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">No Driver Available Currently</h3>
            <p className="text-yellow-700">Increasing the fare might help you find a ride.</p>
          </div>
        )}
      </div>

      {driverAccepted && acceptedDriver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-semibold">{acceptedDriver.driverName}</h3>
              <div className="flex items-center mt-1">
                <span className="text-yellow-400">★</span>
                <span className="ml-1">{acceptedDriver.rating}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">${acceptedDriver.pricePerPerson} per person</p>
              <p className="text-xl text-blue-600 font-bold">Total: ${acceptedDriver.totalPrice}</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">Car: {acceptedDriver.carName}</p>
          <div className="bg-green-100 p-3 rounded-lg">
            <p className="text-green-700 text-center">Driver has accepted your ride request!</p>
          </div>
        </motion.div>
      )}

      {!driverAccepted && proposals.map((proposal, index) => (
        <motion.div
          key={proposal.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white p-6 rounded-lg shadow-md mb-4"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-semibold">{proposal.driverName}</h3>
              <div className="flex items-center mt-1">
                <span className="text-yellow-400">★</span>
                <span className="ml-1">{proposal.rating}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">${proposal.pricePerPerson} per person</p>
              <p className="text-xl text-blue-600 font-bold">Total: ${proposal.totalPrice}</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">Car: {proposal.carName}</p>
          <button
            onClick={() => handleAccept(proposal)}
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            Accept
          </button>
        </motion.div>
      ))}

      {showSuccessModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.5 }}
            className="bg-white p-8 rounded-lg"
          >
            <h3 className="text-2xl font-bold mb-4">Trip Booked Successfully!</h3>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default FindDriver;
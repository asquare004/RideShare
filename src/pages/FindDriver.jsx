import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';


function FindDriver() {
  const [timeLeft, setTimeLeft] = useState(60); // 10 minutes in seconds
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
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAccept = (proposalId) => {
    setShowSuccessModal(true);
  };

  const handleReject = (proposalId) => {
    setProposals(proposals.filter(p => p.id !== proposalId));
  };

  // Sort proposals by total price in descending order
  const sortedProposals = [...proposals].sort((a, b) => b.totalPrice - a.totalPrice);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <div className="text-4xl font-bold mb-4">{formatTime(timeLeft)}</div>
        {timeLeft > 0 && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {sortedProposals.map((proposal, index) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white p-6 rounded-lg shadow-md"
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
            <div className="flex gap-4">
              <button
                onClick={() => handleAccept(proposal.id)}
                className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(proposal.id)}
                className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </motion.div>
        ))}
      </div>

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
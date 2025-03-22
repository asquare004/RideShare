import React, { useState } from 'react';
import { motion } from 'framer-motion';

function PaymentHistory() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Dummy data for payment history
  const payments = [
    {
      id: 1,
      date: "2025-03-18",
      amount: 245.75,
      trips: 8,
      type: 'deposit',
      status: 'completed'
    },
    {
      id: 2,
      date: "2025-03-17",
      amount: 198.50,
      trips: 6,
      type: 'deposit',
      status: 'completed'
    },
    {
      id: 3,
      date: "2025-03-16",
      amount: 25.00,
      trips: 0,
      type: 'withdrawal',
      status: 'processing'
    }
  ];

  const stats = {
    week: {
      totalEarnings: 642.25,
      totalTrips: 18,
      averagePerTrip: 35.68
    },
    month: {
      totalEarnings: 2845.75,
      totalTrips: 82,
      averagePerTrip: 34.70
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-md ${
                selectedPeriod === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedPeriod('week')}
            >
              This Week
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                selectedPeriod === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedPeriod('month')}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-50 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Earnings</h3>
            <p className="text-3xl font-bold text-blue-600">
              ${stats[selectedPeriod].totalEarnings.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {selectedPeriod === 'week' ? 'This Week' : 'This Month'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-50 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Trips</h3>
            <p className="text-3xl font-bold text-blue-600">
              {stats[selectedPeriod].totalTrips}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {selectedPeriod === 'week' ? 'This Week' : 'This Month'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Per Trip</h3>
            <p className="text-3xl font-bold text-blue-600">
              ${stats[selectedPeriod].averagePerTrip.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {selectedPeriod === 'week' ? 'This Week' : 'This Month'}
            </p>
          </motion.div>
        </div>

        {/* Transactions List */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      payment.type === 'deposit' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {payment.type === 'deposit' ? (
                        <span className="text-green-600 text-xl">↓</span>
                      ) : (
                        <span className="text-blue-600 text-xl">↑</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {payment.type === 'deposit' ? 'Earnings Deposit' : 'Withdrawal'}
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(payment.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      payment.type === 'deposit' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {payment.type === 'deposit' ? '+' : '-'}${payment.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {payment.status === 'completed' ? 'Completed' : 'Processing'}
                    </p>
                  </div>
                </div>
                {payment.type === 'deposit' && (
                  <div className="mt-2 text-sm text-gray-600">
                    {payment.trips} trips
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default PaymentHistory;

import React from 'react';

function Profile() {
  const userProfile = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    totalRides: 24,
    rating: 4.5
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 mt-24">
      <h2 className="text-2xl font-semibold mb-6 text-center">User Profile</h2>
      <div className="flex flex-col items-center space-y-4">
        <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-4xl">
          👤
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold">{userProfile.name}</h3>
          <p className="text-gray-600">{userProfile.email}</p>
        </div>
        <div className="w-full space-y-2">
          <div className="flex justify-between">
            <span>Total Rides</span>
            <span className="font-semibold">{userProfile.totalRides}</span>
          </div>
          <div className="flex justify-between">
            <span>User Rating</span>
            <span className="font-semibold">{userProfile.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
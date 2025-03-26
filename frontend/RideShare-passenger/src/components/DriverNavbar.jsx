import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function DriverNavbar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          RideShare
        </Link>
        <div className="flex space-x-4">
          <Link to="/upcoming-trips" className="hover:text-blue-200">
            Upcoming Trips
          </Link>
          <Link to="/history" className="hover:text-blue-200">
            History
          </Link>
          <Link to="/profile" className="hover:text-blue-200">
            Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="hover:text-blue-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default DriverNavbar; 
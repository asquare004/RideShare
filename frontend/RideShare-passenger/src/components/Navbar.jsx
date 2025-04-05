import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signOutSuccess } from '../redux/user/userSlice';

function Navbar() {
  const { currentUser } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = () => {
    dispatch(signOutSuccess());
    setShowSignOutModal(false);
    navigate('/');
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-100 shadow-sm fixed w-full top-0 z-50">
        <div className="container mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center cursor-pointer">
            <span className="text-3xl text-blue-600 font-sans font-semibold tracking-tight">
              Ride<span className="font-bold">Share</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link
              to='/'
              className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white'
            >
              <button 
                className="text-gray-600 hover:text-blue-600 text-base font-inter transition-colors duration-200"
              >
                Find Rides
              </button>
            </Link>
            <Link
              to='/create-ride'
              className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white'
            >
              <button 
                className="text-gray-600 hover:text-blue-600 text-base font-inter transition-colors duration-200"
              >
                Create Ride
              </button>
            </Link>
            <Link
              to='/my-trips'
              className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white'
            >
              <button 
                className="text-gray-600 hover:text-blue-600 text-base font-inter transition-colors duration-200"
              >
                My Trips
              </button>
            </Link>
            {currentUser ? (
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-6 py-2 rounded-md text-base font-inter hover:bg-red-700 transition-all duration-200"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to='/sign-in'
                className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white'
              >
                <button 
                  className="bg-blue-600 text-white px-6 py-2 rounded-md text-base font-inter hover:bg-blue-700 transition-all duration-200"
                >
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sign Out Confirmation
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to sign out?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 transition-colors duration-200"
              >
                No, Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
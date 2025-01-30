import React from 'react';
import { Link} from 'react-router-dom';

function Navbar({ setCurrentPage }) {
  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm fixed w-full top-0 z-50">
      <div className="container mx-auto px-8 py-4 flex justify-between items-center">
        <div 
          onClick={() => setCurrentPage('search')}
          className="flex items-center cursor-pointer"
        >
          <span className="text-3xl text-blue-600 font-sans tracking-tight ">
            Ride<span className="font-semibold">Share</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-8">
        <Link
        to='/'
        className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white'
      >
      <button 
            // onClick={() => setCurrentPage('search')}
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
        to='/profile'
        className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white'
      >
          <button 
           
            className="text-gray-600 hover:text-blue-600 text-base font-inter transition-colors duration-200"
          >
            Profile
          </button>
          </Link>
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
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
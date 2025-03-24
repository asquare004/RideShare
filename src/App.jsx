import React, { useEffect, useState } from 'react';
import { auth } from './firebase/config';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import Navbar from './components/Navbar';
import DriverNavbar from './components/DriverNavbar';
import RideSearch from './pages/RideSearch';
import RideCreate from './pages/RideCreate';
import Profile from './pages/Profile';
import FindDriver from './pages/FindDriver';
import FindingDriver from './pages/FindingDriver';
import RideConfirmation from './pages/RideConfirmation';
import RideDetail from './pages/RideDetail';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import MyTrips from './pages/MyTrips';
import UpcomingTrips from './pages/UpcomingTrips';
import History from './pages/History';
import BookingDetails from './pages/BookingDetails';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
    <div className="min-h-screen bg-gray-50">
    <Navbar></Navbar>
      <Routes>
       
        <Route path='/' element={<RideSearch />} />
        <Route path='/create-ride' element={<RideCreate />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/search' element={<RideSearch />} />
        <Route path='/book-ride' element={<RideCreate />} />
        <Route path='/sign-in' element={<SignIn />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/my-trips' element={<MyTrips />} />
        <Route path='/find-driver' element={<FindDriver />} />
        <Route path='/finding-driver/:rideId' element={<FindingDriver />} />
        <Route path='/ride-confirmation' element={<RideConfirmation />} />
        <Route path='/ride/:rideId' element={<RideDetail />} />
        <Route path='/upcoming-trips' element={<UpcomingTrips />} />
        <Route path='/history' element={<History />} />
        <Route path='/booking-details' element={<BookingDetails />} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={5000} />
    </div>
    </BrowserRouter>
  );
}

export default App;

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import RideSearch from './pages/RideSearch';
import RideCreate from './pages/RideCreate';
import Profile from './pages/Profile';
import FindDriver from './pages/FindDriver';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import MyTrips from './pages/MyTrips';


function App() {
  return (
    <BrowserRouter>
    <div className="min-h-screen bg-gray-50">
      <Navbar  />
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
      </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RideSearch from './pages/RideSearch';
import RideCreate from './pages/RideCreate';
import Profile from './pages/Profile';
import RideProposals from './pages/RideProposals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [currentPage, setCurrentPage] = useState('search');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const renderPage = () => {
    switch(currentPage) {
      case 'search': return <RideSearch />;
      case 'create': return <RideCreate />;
      case 'profile': return <Profile />;
      case 'book-ride':return <RideCreate />;
      default: return <RideSearch />;
      // case 'proposals': return <RideProposals />;
    }
  };

  return (
    <BrowserRouter>
    <div className="min-h-screen bg-gray-50">
      <Navbar setCurrentPage={setCurrentPage} />
      
      <Routes>
        <Route path='/' element={<RideSearch />} />
        <Route path='/create-ride' element={<RideCreate />} />
        <Route path='/profile' element={<Profile />} />
        {/* <Route path='/sign-up' element={<SignUp />} /> */}
        <Route path='/search' element={<RideSearch />} />
        <Route path='/book-ride' element={<RideCreate />} />
        <Route path='/sign-in' element={<SignIn />} />
        <Route path='/sign-up' element={<SignUp />} />
        
      </Routes>
      {/* <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main> */}
    </div>
    </BrowserRouter>
  );
}

export default App;
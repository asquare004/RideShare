import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

const HomePage = () => {
  const handlePassengerPortal = () => {
    window.location.href = import.meta.env.VITE_PASSENGER_URL || 'http://localhost:5175';
  };

  const handleDriverPortal = () => {
    window.location.href = import.meta.env.VITE_DRIVER_URL || 'http://localhost:5174';
  };

  return (
    <div className="app-container">
      <Hero 
        onPassengerPortal={handlePassengerPortal}
        onDriverPortal={handleDriverPortal}
      />
      <Features />
      <HowItWorks />
      <CTA 
        onPassengerPortal={handlePassengerPortal}
        onDriverPortal={handleDriverPortal}
      />
      <Footer />
    </div>
  );
};

export default HomePage; 
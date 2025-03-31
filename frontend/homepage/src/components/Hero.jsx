import React from 'react';
import { FaCar, FaMapMarkerAlt, FaStar } from 'react-icons/fa';

const Hero = ({ onPassengerPortal, onDriverPortal }) => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            Share Rides, Save Money, <span className="gradient-text">Go Green</span>
          </h1>
          <h2 className="hero-subtitle">Your Smart Ride-Sharing Solution</h2>
          <p className="hero-description">
            Connect with fellow travelers, reduce your carbon footprint, and save on transportation costs. 
            Join our community of eco-conscious commuters today.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={onPassengerPortal}>
              Passenger Portal
            </button>
            <button className="btn btn-secondary" onClick={onDriverPortal}>
              Driver Portal
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-elements">
            <div className="float-element car">
              <FaCar />
            </div>
            <div className="float-element location">
              <FaMapMarkerAlt />
            </div>
            <div className="float-element star">
              <FaStar />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 
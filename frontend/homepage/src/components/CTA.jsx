import React from 'react';

const CTA = ({ onPassengerPortal, onDriverPortal }) => {
  return (
    <section className="cta">
      <div className="cta-content">
        <h2>Ready to Start Your Journey?</h2>
        <p>Join thousands of users who are already saving money and reducing their carbon footprint.</p>
        <div className="cta-buttons">
          <button className="btn btn-primary" onClick={onPassengerPortal}>
            Passenger Portal
          </button>
          <button className="btn btn-secondary" onClick={onDriverPortal}>
            Driver Portal
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA; 
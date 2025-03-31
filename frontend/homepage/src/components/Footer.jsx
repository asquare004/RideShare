import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>RideShare</h3>
          <p>Your trusted platform for safe and comfortable rides</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <a href="#">About Us</a>
          <a href="#">Contact</a>
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
        </div>
        <div className="footer-section">
          <h4>Connect With Us</h4>
          <div className="social-links">
            <a href="#" className="social-link">📱</a>
            <a href="#" className="social-link">📧</a>
            <a href="#" className="social-link">💬</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 RideShare. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 
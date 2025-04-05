import React from 'react';

const Features = () => {
  const features = [
    {
      icon: '🛡️',
      title: 'Safe & Secure',
      description: 'Verified drivers and ride tracking ensure your safety throughout the journey'
    },
    {
      icon: '💰',
      title: 'Best Rates',
      description: 'Competitive pricing with transparent fare calculation and no hidden charges'
    },
    {
      icon: '⭐',
      title: 'Premium Service',
      description: 'We connect drivers and passengers efficiently while offering flexibility, affordability, and reliability'
    },
    {
      icon: '⏱️',
      title: '24/7 Support',
      description: 'We offer round-the-clock ride booking and ride sharing service'
    }
  ];

  return (
    <section className="features">
      <div className="section-header">
        <h2>Why Choose RideShare?</h2>
        <p>Experience the difference with our premium service</p>
      </div>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features; 
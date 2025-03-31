import React from 'react';

const Features = () => {
  const features = [
    {
      icon: '🛡️',
      title: 'Safe & Secure',
      description: 'Verified drivers and real-time tracking ensure your safety throughout the journey'
    },
    {
      icon: '💰',
      title: 'Best Rates',
      description: 'Competitive pricing with transparent fare calculation and no hidden charges'
    },
    {
      icon: '⭐',
      title: 'Premium Service',
      description: 'Professional drivers and well-maintained vehicles for your comfort'
    },
    {
      icon: '⏱️',
      title: '24/7 Support',
      description: 'Round-the-clock customer support for any assistance you need'
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
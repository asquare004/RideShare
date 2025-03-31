import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: '1',
      icon: '📍',
      title: 'Find a Ride',
      description: 'Enter your pickup and drop-off location. If you don\'t have a location, you can use the map to find a location.'

    },
    {
      number: '2',
      icon: '🔍',
      title: 'Book a Ride',
      description: 'Find matching rides according to your requirements. If you don\'t find a ride, you can create a ride.'
    },
    {
      number: '3',
      icon: '🚗',
      title: 'Track Your Ride',
      description:'We\'ll find the perfect driver for you and provide you with the details of the ride.'
    },
    {
      number: '4',
      icon: '✨',
      title: 'Enjoy Your Journey',
      description: 'Sit back and relax in comfort.'
    }
  ];

  return (
    <section className="how-it-works">
      <div className="section-header">
        <h2>How It Works</h2>
        <p>Simple steps to get started</p>
      </div>
      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={index} className="step">
            <div className="step-number">{step.number}</div>
            <div className="step-icon">{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks; 
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { RideProvider } from './context/RideContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RideProvider>
      <App />
    </RideProvider>
  </React.StrictMode>
);
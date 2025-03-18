import { useState } from 'react';
import { INITIAL_FORM_STATE, RIDE_CONSTANTS } from '../constants/ride';

export const useRideForm = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'availableSeats') {
      const numValue = parseInt(value);
      if (numValue > RIDE_CONSTANTS.MAX_PASSENGERS) {
        setError(`One car can have maximum ${RIDE_CONSTANTS.MAX_PASSENGERS} passengers`);
        return;
      }
      setError('');
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePassengerInput = (value) => {
    const numValue = parseInt(value);

    if (numValue > RIDE_CONSTANTS.MAX_PASSENGERS) {
      setError(`One car can have maximum ${RIDE_CONSTANTS.MAX_PASSENGERS} passengers`);
      setFormData(prev => ({
        ...prev,
        availableSeats: RIDE_CONSTANTS.MAX_PASSENGERS.toString()
      }));
      return;
    }
    
    setError('');
    setFormData(prev => ({
      ...prev,
      availableSeats: value
    }));
  };

  return {
    formData,
    setFormData,
    error,
    setError,
    handleChange,
    handlePassengerInput
  };
}; 
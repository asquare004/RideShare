import React, { useState } from 'react';

function SearchForm({ onSearch }) {
  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];
  
  // Local state for form values
  const [formValues, setFormValues] = useState({
    source: '',
    destination: '',
    date: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update local state
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Call onSearch with all current values
    onSearch({
      ...formValues,
      [name]: value
    });
  };

  return (
    <div className="bg-white rounded-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
          <input 
            type="text" 
            name="source"
            value={formValues.source}
            placeholder="Search by any part of address" 
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
          <input 
            type="text" 
            name="destination"
            value={formValues.destination}
            placeholder="Search by any part of address" 
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input 
            type="date" 
            name="date"
            value={formValues.date}
            min={today}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
          </svg>
          Results update as you type. Search for any part of the address to find matching rides.
        </p>
      </div>
    </div>
  );
}

export default SearchForm;
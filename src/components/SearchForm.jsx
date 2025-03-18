import React from 'react';

function SearchForm({ onSearch }) {
  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Call onSearch immediately with updated values
    onSearch({
      source: name === 'source' ? value : document.querySelector('input[name="source"]').value,
      destination: name === 'destination' ? value : document.querySelector('input[name="destination"]').value,
      date: name === 'date' ? value : document.querySelector('input[name="date"]').value
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
            placeholder="Enter source location" 
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
          <input 
            type="text" 
            name="destination"
            placeholder="Enter destination" 
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input 
            type="date" 
            name="date"
            min={today}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

export default SearchForm;
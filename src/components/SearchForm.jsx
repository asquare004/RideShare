import React, { useState } from 'react';

function SearchForm({ onSearch }) {
  const [searchParams, setSearchParams] = useState({
    source: '',
    destination: '',
    date: '',
    maxPrice: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Find Your Ride</h2>
      <div className="grid grid-cols-2 gap-4">
        <input 
          type="text" 
          placeholder="From" 
          value={searchParams.source}
          onChange={(e) => setSearchParams({...searchParams, source: e.target.value})}
          className="border p-2 rounded"
        />
        <input 
          type="text" 
          placeholder="To" 
          value={searchParams.destination}
          onChange={(e) => setSearchParams({...searchParams, destination: e.target.value})}
          className="border p-2 rounded"
        />
        <input 
          type="date" 
          value={searchParams.date}
          onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
          className="border p-2 rounded"
        />
        <input 
          type="number" 
          placeholder="Max Price" 
          value={searchParams.maxPrice}
          onChange={(e) => setSearchParams({...searchParams, maxPrice: e.target.value})}
          className="border p-2 rounded"
        />
        <button 
          type="submit" 
          className="col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Search Rides
        </button>
      </div>
    </form>
  );
}

export default SearchForm;
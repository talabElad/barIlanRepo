import React, { useState } from 'react';

const SearchComponent = ({ onSearch }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchText, setSearchText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ startDate, endDate, searchText });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="date" 
        value={startDate} 
        onChange={(e) => setStartDate(e.target.value)} 
        placeholder="Start Date" 
      />
      <input 
        type="date" 
        value={endDate} 
        onChange={(e) => setEndDate(e.target.value)} 
        placeholder="End Date" 
      />
      <input 
        type="text" 
        value={searchText} 
        onChange={(e) => setSearchText(e.target.value)} 
        placeholder="Search..." 
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchComponent;

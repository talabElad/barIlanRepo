import React, { useState } from 'react';

const InstructorsList = ({ instructors, onInstructorClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInstructors = instructors.filter(instructor => 
    instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="list-wrap instructors">
      <h2>Instructors</h2>
      <input 
        type="text" 
        placeholder="Search Instructors..." 
        value={searchTerm} 
        onChange={e => setSearchTerm(e.target.value)} 
      />
      <ul>
        {filteredInstructors.map(instructor => (
          <li key={instructor} onClick={() => onInstructorClick(instructor)} className='item'>
            <div className="folder-img"></div>
            <span>{instructor}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InstructorsList;

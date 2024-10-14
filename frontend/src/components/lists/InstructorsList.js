import React, { useState } from 'react';

const InstructorsList = ({ instructors, onInstructorClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInstructors = instructors.filter(instructor => 
    instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="list-wrap instructors">
      <div className='title-wrap'>
        <h2>Instructors</h2>
        <span>({filteredInstructors.length})</span>
      </div>
      <div className='search-conteiner'>
        <input type="text" className='free-text' placeholder="Search Instructor..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>
      {searchTerm && filteredInstructors.length !== instructors.length && (
        <div className='filter-status'><p>Shown Filtered Results</p></div>
      )}

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

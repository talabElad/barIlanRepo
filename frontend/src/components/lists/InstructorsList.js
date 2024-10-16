import React, { useState } from 'react';
import InstructorsListItems from '../ListItems/InstructorsListItems';

const InstructorsList = ({ instructors, onClickFromAdminInstructor, onClickFromHomeInstructor }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInstructors = instructors.filter(instructor => 
    instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInstructorClick = (instructorCode) => {
    // Call the relevant handler based on where the click originated
    if (onClickFromAdminInstructor) {
      onClickFromAdminInstructor(instructorCode);
    }
    if (onClickFromHomeInstructor) {
      onClickFromHomeInstructor(instructorCode);
    }
  };

  return (
    <div className="list-wrap instructors">
      <div className='title-wrap'>
        <h2>Instructors</h2>
        <span>({filteredInstructors.length})</span>
      </div>
      <div className='search-container'>
        <div className='free-text-item'>
          <label htmlFor="freeText"></label>
          <input type="text" id="freeText" className='free-text' placeholder="Search Instructor..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>
      {searchTerm && filteredInstructors.length !== instructors.length && (
        <div className='filter-status'><p>Shown Filtered Results</p></div>
      )}

      <InstructorsListItems instructors={filteredInstructors} onInstructorClick={handleInstructorClick} />

    </div>
  );
};

export default InstructorsList;

import React from 'react';

const InstructorsList = ({ instructors, onInstructorClick }) => (
  <div className="list-wrap instructors">
    <h1>Instructors List</h1>
    <ul>
      {instructors.map((instructor) => (
        <li key={instructor} onClick={() => onInstructorClick(instructor)} className='item'>
          <div className="folder-img"></div>
          <span>{instructor}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default InstructorsList;

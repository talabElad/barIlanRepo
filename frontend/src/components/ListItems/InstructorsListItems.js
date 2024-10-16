import React from 'react';

const InstructorsListItems = ({ instructors, onInstructorClick }) => (
  <ul>
    {instructors.map(instructor => (
      <li key={instructor} onClick={() => onInstructorClick(instructor)} className='item'>
        <div className="folder-img"></div>
        <span>{instructor}</span>
      </li>
    ))}
  </ul>
);

export default InstructorsListItems;

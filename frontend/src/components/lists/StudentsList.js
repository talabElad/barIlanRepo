import React from 'react';

const StudentsList = ({ students, onStudentClick }) => (
  <div className="list-wrap students">
    <h2>Students</h2>
    <ul>
      {students.map((student) => (
        <li key={student} onClick={() => onStudentClick(student)} className='item'>
          <div className="folder-img"></div>
          <span>{student}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default StudentsList;

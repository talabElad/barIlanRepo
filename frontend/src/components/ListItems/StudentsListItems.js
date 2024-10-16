import React from 'react';

const StudentsListItems = ({ students, onStudentClick }) => (
    <ul>
    {students.map(student => (
        <li key={student} onClick={() => onStudentClick(student)} className='item'>
        <div className="folder-img"></div>
        <span>{student}</span>
        </li>
    ))}
    </ul>
);

export default StudentsListItems;

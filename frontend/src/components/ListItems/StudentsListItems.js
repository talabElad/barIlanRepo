import React from 'react';

const StudentsListItems = ({ students, onStudentClick }) => (
    <ul>
    
    {students.length > 0 ? (
        students.map(student => (
            <li key={student} onClick={() => onStudentClick(student)} className='item'>
            <div className="folder-img"></div>
            <span>{student}</span>
            </li>
        ))
    ) : (
    <div>No Students found</div>
    )}
    </ul>
);

export default StudentsListItems;

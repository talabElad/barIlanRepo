import React, { useState } from 'react';

const StudentsList = ({ students, onStudentClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student => 
    student.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="list-wrap students">
      <h2>Students</h2>
      <input 
        type="text" 
        placeholder="Search Students..." 
        value={searchTerm} 
        onChange={e => setSearchTerm(e.target.value)} 
      />
      <ul>
        {filteredStudents.map(student => (
          <li key={student} onClick={() => onStudentClick(student)} className='item'>
            <div className="folder-img"></div>
            <span>{student}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentsList;

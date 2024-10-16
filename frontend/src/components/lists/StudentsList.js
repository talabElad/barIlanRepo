import React, { useState } from 'react';
import StudentsListItems from '../ListItems/StudentsListItems';

const StudentsList = ({ students, onClickFromAdminStudent, onClickFromHomeStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student => 
    student.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStudentClick = (studentCode) => {
    // Call the relevant handler based on where the click originated
    if (onClickFromAdminStudent) {
      onClickFromAdminStudent(studentCode);
    }
    if (onClickFromHomeStudent) {
      onClickFromHomeStudent(studentCode);
    }
  };


  return (
    <div className="list-wrap students">
      <div className='title-wrap'>
        <h2>Students</h2>
        <span>({filteredStudents.length})</span>
      </div>
      <div className='search-container'>
        <div className='free-text-item'>
          <label htmlFor="freeText"></label>
          <input type="text" id="freeText" className='free-text' placeholder="Search Student..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>
      {searchTerm && filteredStudents.length !== students.length && (
        <div className='filter-status'><p>Shown Filtered Results</p></div>
      )}

      <StudentsListItems students={filteredStudents} onStudentClick={handleStudentClick} />
    </div>
  );
};

export default StudentsList;

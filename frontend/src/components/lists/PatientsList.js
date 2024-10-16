import React, { useState } from 'react';
import PatientsListItems from '../ListItems/PatientsListItems';

const PatientsList = ({ patients, onClickFromAdminPatient, onClickFromHomePatient }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(patient =>
    patient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientClick = (studentCode) => {
    // Call the relevant handler based on where the click originated
    if (onClickFromAdminPatient) {
      onClickFromAdminPatient(studentCode);
    }
    if (onClickFromHomePatient) {
      onClickFromHomePatient(studentCode);
    }
  };

  return (
    <div className="list-wrap patients">


      <div className='title-wrap'>
        <h2>Patients</h2>
        <span>({filteredPatients.length})</span>
      </div>
      <div className='search-container'>
        <div className='free-text-item'>
          <label htmlFor="freeText"></label>
          <input type="text" id="freeText" className='free-text' placeholder="Search Patient..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>
      {searchTerm && filteredPatients.length !== patients.length && (
        <div className='filter-status'><p>Shown Filtered Results</p></div>
      )}
      <PatientsListItems patients={filteredPatients} onPatientClick={handlePatientClick} />
    </div>
  );
};

export default PatientsList;

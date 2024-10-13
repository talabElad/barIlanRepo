import React, { useState } from 'react';

const PatientsList = ({ patients, onPatientClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(patient =>
    patient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="list-wrap patients">
      <h2>Patients</h2>
      <input 
        type="text" 
        placeholder="Search Patients by Code..." 
        value={searchTerm} 
        onChange={e => setSearchTerm(e.target.value)} 
      />
      <ul>
        {filteredPatients.map(patientCode => (
          <li key={patientCode} onClick={() => onPatientClick(patientCode)} className='item'>
            <div className="folder-img"></div>
            <span>Patient Code: {patientCode}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientsList;

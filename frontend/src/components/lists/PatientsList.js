import React from 'react';

const PatientsList = ({ patients, onPatientClick }) => (
  <div className="list-wrap patients">
    <h2>Patients</h2>
    <ul>
      {patients.map((patientCode) => (
        <li key={patientCode} onClick={() => onPatientClick(patientCode)} className='item'>
          <div className="folder-img"></div>
          <span>Patient Code: {patientCode}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default PatientsList;

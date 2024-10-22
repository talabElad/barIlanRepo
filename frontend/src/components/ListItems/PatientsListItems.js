import React from 'react';

const PatientsListItems = ({ patients, onPatientClick }) => (
    <ul>

    
    {patients.length > 0 ? (    
        patients.map(patient => (
            <li key={patient} onClick={() => onPatientClick(patient)} className='item'>
            <div className="folder-img"></div>
            <span>{patients}</span>
            </li>
        ))
    ) : (
        <div>No Patients found</div>
    )}
    </ul>

);

export default PatientsListItems;

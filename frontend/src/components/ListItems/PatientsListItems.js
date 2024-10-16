import React from 'react';

const PatientsListItems = ({ patients, onPatientClick }) => (
    <ul>
    {patients.map(patient => (
        <li key={patient} onClick={() => onPatientClick(patient)} className='item'>
        <div className="folder-img"></div>
        <span>{patients}</span>
        </li>
    ))}
    </ul>
);

export default PatientsListItems;

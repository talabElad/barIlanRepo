import React, { useState } from 'react';
import dynamoDB from '../aws/awsConfig'; // Ensure this path is correct
//import './AdminSearch.scss';

const AdminSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Instructors');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const fetchedResults = await queryData(selectedRole, searchTerm);
    setResults(fetchedResults);
  };

  const queryData = async (role, searchTerm) => {
    let params;

    // Setup query parameters based on the selected role
    if (role === 'Instructors' || role === 'Students') {
      params = {
        TableName: 'BarIlanGuidanceTree',
        FilterExpression: 'contains(#code, :searchTerm)',
        ExpressionAttributeNames: {
          '#code': getRoleCode(role),
        },
        ExpressionAttributeValues: {
          ':searchTerm': searchTerm,
        },
      };
    } else if (role === 'Patients') {
      params = {
        TableName: 'BarIlanTherapistPatients',
        FilterExpression: 'contains(patient_code, :searchTerm)',
        ExpressionAttributeValues: {
          ':searchTerm': searchTerm,
        },
      };
    } else if (role === 'Videos') {
      params = {
        TableName: 'BarIlanSessionsFiles',
        FilterExpression: 'contains(full_video_name, :searchTerm)',
        ExpressionAttributeValues: {
          ':searchTerm': searchTerm,
        },
      };
    }

    try {
      const data = await dynamoDB.scan(params).promise();
      return data.Items.map(item => item[getRoleCode(role)] || item.patient_code || item.video_name);
    } catch (error) {
      console.error(`Error fetching ${role.toLowerCase()}:`, error);
      return [];
    }
  };

  const getRoleCode = (role) => {
    switch (role) {
      case 'Instructors':
        return 'therapist_code_leader';
      case 'Students':
        return 'therapist_code_student ';
      case 'Patients':
        return 'patient_code';
      case 'Videos':
        return 'full_video_name';
      default:
        return '';
    }
  };

  return (
    <div className="admin-search-container">
      <h2>Admin Search</h2>
      <select onChange={(e) => setSelectedRole(e.target.value)}>
        <option value="Instructors">Instructors</option>
        <option value="Students">Students</option>
        <option value="Patients">Patients</option>
        <option value="Videos">Videos</option>
      </select>
      <input
        type="text"
        placeholder={`Search ${selectedRole}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <div className="list-wrap">
        <h2>{selectedRole}</h2>
        <ul>
          {results.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminSearch;

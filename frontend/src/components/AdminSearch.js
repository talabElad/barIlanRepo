import React, { useState, useEffect } from 'react';
import dynamoDB from '../aws/awsConfig';
import InstructorsList from './lists/InstructorsList';
import StudentsList from './lists/StudentsList';
import PatientsList from './lists/PatientsList';
import VideosList from './lists/VideosList';

import StudentsListItems from './ListItems/StudentsListItems';
import useStudents from '../hooks/useStudents';

import PatientsListItems from './ListItems/PatientsListItems';
import usePatients from '../hooks/usePatients';

import VideosListItems from './ListItems/VideosListItems';
import useVideos from '../hooks/useVideos';
//import './AdminSearch.scss';

const AdminSearch = ({ handleStudentClick, handlePatientClick, handleVideoClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Instructors');
  const [results, setResults] = useState([]);
  const { students, fetchStudents } = useStudents();
  const { patients, fetchPatients } = usePatients();
  const { groupedVideos, fetchVideos } = useVideos();

  const handleSearch = async () => {
    const fetchedResults = await queryData(selectedRole, searchTerm);
    setResults(fetchedResults);
  };
  
  useEffect(() => {
    if (selectedRole === 'Patients') {
      setResults(patients);
    }
  }, [patients, selectedRole]);

  useEffect(() => {
    if (selectedRole === 'Videos') {
      setResults(groupedVideos);
      console.log('Updating results with videos:', groupedVideos);
      
    }
  }, [groupedVideos, selectedRole]);

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
      const uniqueResults = [...new Set(data.Items.map(item => item[getRoleCode(role)] || item.patient_code || item.video_name))];
      return uniqueResults;
    } catch (error) {
      console.error(`Error fetching ${role.toLowerCase()}:`, error);
      return [];
    }
  };

  const handleItemClick = (instructorCode) => {
    fetchStudents(instructorCode);
    setResults(students);
  };

  const handleItemStudentClick = async (studentCode) => {
    await fetchPatients(studentCode);
    setResults(patients);
    setSelectedRole('Patients');
  };

  const handleItemPatientClick = async (patientCode) => {
    await fetchVideos(patientCode);
    setResults(groupedVideos);
    setSelectedRole('Videos');
  };

  const handleItemVideoClick = async (patientCode) => {
    // setSelectedVideo(video.fullVideoName);
    // setSelectedSession(video.sessionName || '');

    await fetchVideos(patientCode);
    setResults(groupedVideos);
    setSelectedRole('Videos');

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

  const renderList = () => {
    switch (selectedRole) {
      case 'Instructors':
        return <InstructorsList instructors={results} onClickFromAdminInstructor={handleItemClick} />;
      case 'Students':
        return <StudentsList students={results} onClickFromAdminStudent={handleItemStudentClick} />;
      case 'Patients':
        return <PatientsList patients={results} onClickFromAdminPatient={handleItemPatientClick} />;
      case 'Videos':
        return <VideosList groupedVideos={results} onClickFromAdminVideo={handleItemVideoClick}/>;
      default:
        return null;
    }
  };

 

  const resetSearch = () => {
    setSearchTerm('');
    setResults([]);
    setSelectedRole('Instructors');
  };

  return (
    <div className="main-container admin-search">
      <div className='list-wrap'>
        <div className='title-wrap'>
          <h2>Admin Search</h2>
          {/* <span>({results.length})</span> */}
        </div>
        <div className='search-container'>
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
          <button onClick={resetSearch}>Reset Search</button>

        </div>

        <h2>{selectedRole}</h2>

        {renderList()}
        {selectedRole === 'Instructors' && students.length > 0 && (
          <StudentsListItems students={students} onStudentClick={handleItemStudentClick} />
        )}
        {selectedRole === 'Students' && (
          <PatientsListItems patients={patients} onPatientClick={handleItemPatientClick} />
        )}
        {/* {selectedRole === 'Patients' && (
          <VideosListItems videos={videos} onVideoClick={handleItemVideoClick} />
        )} */}
        {selectedRole === 'Videos' && (
          <VideosListItems videos={groupedVideos} onVideoClick={handleItemVideoClick} />
        )}

      </div>
    </div>
  );
};

export default AdminSearch;

import React, { useState, useEffect, useMemo } from 'react';
import InstructorsList from './lists/InstructorsList';
import StudentsList from './lists/StudentsList';
import PatientsList from './lists/PatientsList';
import VideosList from './lists/VideosList';
import useStudents from '../hooks/useStudents';
import usePatients from '../hooks/usePatients';
import useVideos from '../hooks/useVideos';
import VideoModal from './VideoModal';
import { fetchAuthSession } from 'aws-amplify/auth';
import '../style/HomePage.scss';

const HomePage = ({ userRole, userCustomId }) => {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [videoTimes, setVideoTimes] = useState({});

  const { students, fetchStudents } = useStudents();
  const { patients, fetchPatients } = usePatients();
  const { videoList, fetchVideos, groupedVideos } = useVideos();

  useEffect(() => {
    console.log('userRole:', userRole);
    console.log('userCustomId:', userCustomId);
  }, [userRole, userCustomId]);

  // Memoize user roles to avoid recalculating on every render
  const isAdmin = useMemo(() => userRole.includes('Admins'), [userRole]);
  const isInstructor = useMemo(() => userRole.includes('Instructors'), [userRole]);
  const isStudent = useMemo(() => userRole.includes('Students'), [userRole]);

  // Effect for fetching instructors (only for Admin users)
  useEffect(() => {
    if (isAdmin) {
      const fetchInstructors = async () => {
        try {
          const token = (await fetchAuthSession()).tokens?.idToken?.toString();
          const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;
          const response = await fetch(`${apiUrl}/fetchinstructors`, {
            method: 'GET',
            headers: {
              Authorization: token,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch instructors');
          }

          const data = await response.json();
          const uniqueInstructors = data.unique_instructors_codes || [];
          setInstructors(uniqueInstructors);
        } catch (error) {
          console.error('Error fetching instructors:', error);
        }
      };

      fetchInstructors();
    }
  }, [isAdmin]);

  // Effect for fetching students (only for Instructor users)
  useEffect(() => {
    if (isInstructor && userCustomId) {
      fetchStudents(userCustomId);
    }
  }, [isInstructor, userCustomId]);

  // Effect for fetching patients (only for Student users)
  useEffect(() => {
    if (isStudent && userCustomId) {
      fetchPatients(userCustomId);
    }
  }, [isStudent, userCustomId]);

  // Effect for handling video tab setup
  useEffect(() => {
    if (selectedVideo && groupedVideos[selectedSession]) {
      const sessionVideos = groupedVideos[selectedSession];
      if (sessionVideos && sessionVideos.length) {
        setActiveTab(sessionVideos[0].fullVideoName);
      }
    }
  }, [selectedVideo, groupedVideos, selectedSession]);

  const handleTimeUpdate = (videoKey, currentTime) => {
    setVideoTimes((prev) => ({
      ...prev,
      [videoKey]: currentTime,
    }));
  };

  const handleInstructorClick = async (instructorCode) => {
    setSelectedInstructor(instructorCode);
    setSelectedStudent(null);
    setSelectedPatient(null);
    console.log('instructorCode:', instructorCode);
    await fetchStudents(instructorCode);
  };

  const handleStudentClick = (studentCode) => {
    setSelectedStudent(studentCode);
    setSelectedPatient(null);
    setSelectedVideo(null);
    fetchPatients(studentCode);
  };

  const handlePatientClick = (patientCode) => {
    setSelectedPatient(patientCode);
    setSelectedVideo(null);
    fetchVideos(patientCode);
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setSelectedSession(video.sessionName || '');
  };

  return (
    <div className="main-container homepage">
      {(selectedInstructor || selectedStudent || selectedVideo || selectedPatient) && (
        <div className="breadcrumbs">
          <span onClick={() => { 
            setSelectedInstructor(null); 
            setSelectedStudent(null); 
            setSelectedVideo(null); 
            setSelectedPatient(null); 
          }}>
            Home
          </span>
          {selectedInstructor && (
            <span onClick={() => { 
              setSelectedStudent(null); 
              setSelectedPatient(null); 
              setSelectedVideo(null); 
            }}>
              / {selectedInstructor}
            </span>
          )}
          {selectedStudent && (
            <span onClick={() => { 
              setSelectedPatient(null); 
              setSelectedVideo(null); 
            }}>
              / {selectedStudent}
            </span>
          )}
          {selectedPatient && (
            <span>
              / {selectedPatient}
            </span>
          )}
        </div>
      )}


      {isAdmin && !selectedInstructor && (
        <InstructorsList instructors={instructors} onClickFromHomeInstructor={handleInstructorClick} />
      )}

      {(isAdmin || isInstructor) && ((!selectedInstructor && isInstructor) || selectedInstructor) && !selectedStudent && (
        <StudentsList students={students} onClickFromHomeStudent={handleStudentClick} />
      )}

      {(isAdmin || isInstructor || isStudent) && ((selectedStudent && !selectedPatient) || (isStudent && !selectedPatient)) && (
        <PatientsList patients={patients} onClickFromHomePatient={handlePatientClick} />
      )}

      {(isAdmin || isInstructor || isStudent) && selectedPatient && (
        <VideosList groupedVideos={groupedVideos} onClickFromHomeVideo={handleVideoClick} />
      )}

      {selectedVideo && (
        <VideoModal
          selectedVideo={selectedVideo}
          setSelectedVideo={setSelectedVideo}
          groupedVideos={groupedVideos}
          selectedSession={selectedSession}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleTimeUpdate={handleTimeUpdate}
        />
      )}

    </div>
  );
};

export default HomePage;

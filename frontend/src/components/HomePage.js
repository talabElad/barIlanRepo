import React, { useState, useEffect } from 'react';
//import dynamoDB from '../aws/awsConfig';
import InstructorsList from './lists/InstructorsList';
import StudentsList from './lists/StudentsList';
import PatientsList from './lists/PatientsList';
import VideosList from './lists/VideosList';
import useStudents from '../hooks/useStudents';
import usePatients from '../hooks/usePatients';
import useVideos from '../hooks/useVideos';
import VideoModal from './VideoModal';
import '../style/HomePage.scss';
import { fetchAuthSession } from 'aws-amplify/auth';


const HomePage = () => {
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

  // Effect for fetching instructors
  useEffect(() => {
    const fetchInstructors = async () => {
      try {

          const token = (await fetchAuthSession()).tokens?.idToken?.toString();
          //console.log("token:", token)

        const response = await fetch('https://uz5qtg0iu1.execute-api.us-east-1.amazonaws.com/test/fetchinstructors', {
          method: 'GET',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
        });
        //console.log("response:", response)

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
  }, []);

  // Effect for handling video tab setup
  useEffect(() => {

    if (selectedVideo) {
      if (groupedVideos[selectedSession] || groupedVideos['']) {
        const sessionVideos = groupedVideos[selectedSession] || groupedVideos[''];
        if (sessionVideos.length) {
          setActiveTab(sessionVideos[0].fullVideoName);
        }
      } else {
        console.warn(`No videos found for session: ${selectedSession}`);
      }
    }
  }, [selectedVideo, groupedVideos, selectedSession]);

  const handleTimeUpdate = (videoKey, currentTime) => {
    setVideoTimes((prev) => ({
      ...prev,
      [videoKey]: currentTime,
    }));
  };

  const handleInstructorClick = (instructorCode) => {
    setSelectedInstructor(instructorCode);
    setSelectedStudent(null);
    setSelectedPatient(null);
    fetchStudents(instructorCode);
  };

  const handleStudentClick = (studentCode) => {
    setSelectedStudent(studentCode);
    setSelectedPatient(null);
    fetchPatients(studentCode);
  };

  const handlePatientClick = (patientCode) => {
    setSelectedPatient(patientCode);
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
          <span onClick={() => { setSelectedInstructor(null); setSelectedStudent(null); setSelectedVideo(null); setSelectedPatient(null); }}>
            Home
          </span>
          {selectedInstructor && (
            <span onClick={() => { setSelectedStudent(null); setSelectedVideo(null); setSelectedPatient(null); }}>
              / {selectedInstructor}
            </span>
          )}
          {selectedStudent && (
            <span onClick={() => { setSelectedVideo(null); setSelectedPatient(null); }}>
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
      {!selectedInstructor && <InstructorsList instructors={instructors} onClickFromHomeInstructor={handleInstructorClick} />}
      {selectedInstructor && !selectedStudent && <StudentsList students={students} onClickFromHomeStudent={handleStudentClick} />}
      {selectedStudent && !selectedPatient && <PatientsList patients={patients} onClickFromHomePatient={handlePatientClick} />}
      {selectedPatient && <VideosList groupedVideos={groupedVideos} onClickFromHomeVideo={handleVideoClick} />}
      {selectedVideo && <VideoModal selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo} groupedVideos={groupedVideos} selectedSession={selectedSession} activeTab={activeTab} setActiveTab={setActiveTab} handleTimeUpdate={handleTimeUpdate} />
    }

    </div>
  );
};

export default HomePage;

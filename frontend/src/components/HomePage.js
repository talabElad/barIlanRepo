import React, { useState, useEffect } from 'react';
import dynamoDB from '../aws/awsConfig';
import InstructorsList from './lists/InstructorsList';
import StudentsList from './lists/StudentsList';
import PatientsList from './lists/PatientsList';
import VideosList from './lists/VideosList';
import useStudents from '../hooks/useStudents';
import usePatients from '../hooks/usePatients';
import useVideos from '../hooks/useVideos';
import '../style/HomePage.scss';

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
      const params = {
        TableName: 'BarIlanGuidanceTree',
        ProjectionExpression: 'therapist_code_leader',
      };

      try {
        const data = await dynamoDB.scan(params).promise();
        const uniqueInstructors = [...new Set(data.Items.map(item => item.therapist_code_leader))];
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
    setSelectedVideo(video.fullVideoName);
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
      
      {selectedVideo && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setSelectedVideo(null)}>&times;</span>
            <div className="tabs">
              
              {groupedVideos[selectedSession]?.map((video) => {
                return (
                  <button
                    key={video.fileKey}
                    className={video.fullVideoName === activeTab ? 'active' : ''}
                    onClick={() => setActiveTab(video.fullVideoName)}
                  >
                    {video.fullVideoName}
                  </button>
                );
              })}
            </div>
            <div className="tab-content">
              {groupedVideos[selectedSession]?.map((video) => {
                return (
                  video.fullVideoName === activeTab && (
                    <div key={video.fileKey}>
                      {video.s3Url ? (
                        <>
                          <video width="560" height="315" src={video.s3Url} controls onTimeUpdate={(e) => handleTimeUpdate(e.target.currentTime)}></video>
                          <div className="video-details">
                            <h4>Session Details:</h4>
                            <dl>
                              <div className='detail'>
                                <dt>Room Number:</dt>
                                <dd>{video.meetingNum}</dd>
                              </div>
                              <div className='detail'>
                                <dt>Meeting Number:</dt>
                                <dd>{video.roomNum}</dd>
                              </div>
                              <div className='detail'>
                                <dt>Patient Code:</dt>
                                <dd>{video.patientCode}</dd>
                              </div>
                            </dl>
                            <dl>
                              <div className='detail'>
                                <dt>Last Modified:</dt>
                                <dd>{new Date(video.lastModified).toLocaleDateString('he-IL')}</dd>
                              </div>
                              <div className='detail'>
                                <dt>Therapist Code:</dt>
                                <dd>{video.therapistCode}</dd>
                              </div>
                              <div className='detail'>
                                <dt>Unique Session Name:</dt>
                                <dd>{video.uniqueSessionName}</dd>
                              </div>
                            </dl>
                          </div>
                        </>
                      ) : (
                        <p>Session not available.</p>
                      )}
                    </div>
                  )
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;

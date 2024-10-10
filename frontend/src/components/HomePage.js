import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk';
import '../style/HomePage.scss';

const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
  region: process.env.REACT_APP_AWS_REGION,
  signatureVersion: 'v4',
});

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

const getVideoMetadata = async (fileKey) => {
  const params = {
    Bucket: 'arn:aws:s3:us-east-1:637423566007:accesspoint/barilanaccesspoint',
    Key: fileKey,
  };

  try {
    const metadata = await s3.headObject(params).promise();
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
};

const getSignedUrl = (fileKey) => {
  const params = {
    Bucket: 'arn:aws:s3:us-east-1:637423566007:accesspoint/barilanaccesspoint',
    Key: fileKey,
    Expires: 60 * 5,
  };

  return s3.getSignedUrl('getObject', params);
};

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const HomePage = ({ isAuthenticated, userRole, userName }) => {
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [patients, setPatients] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

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

  const fetchStudents = async (therapistCodeLeader) => {
    const params = {
      TableName: 'BarIlanGuidanceTree',
      KeyConditionExpression: 'therapist_code_leader = :leaderCode',
      ExpressionAttributeValues: {
        ':leaderCode': therapistCodeLeader,
      },
    };

    try {
      const data = await dynamoDB.query(params).promise();
      const studentCodes = data.Items.map(item => item['therapist_code_student ']);
      setStudents(studentCodes);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchPatients = async (therapistCodeStudent) => {
    const params = {
      TableName: 'BarIlanTherapistPatients',
      KeyConditionExpression: 'therapist_code = :studentCode',
      ExpressionAttributeValues: {
        ':studentCode': therapistCodeStudent.trim(),
      },
    };
  
    try {
      const data = await dynamoDB.query(params).promise();
      const patientCodes = data.Items.map(item => item.patient_code);
      const uniquePatients = [...new Set(patientCodes)];
      setPatients(uniquePatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchVideos = async (patientCode) => {
    const params = {
      TableName: 'BarIlanSessionsFiles',
      FilterExpression: 'patient_code = :patientCode',
      ExpressionAttributeValues: {
        ':patientCode': patientCode,
      },
    };

    try {
      const data = await dynamoDB.scan(params).promise();
      const videoList = await Promise.all(data.Items.map(async (item) => {
        const metadata = await getVideoMetadata(item.file_key_to_s3);
        const signedUrl = getSignedUrl(item.file_key_to_s3);
        
        return {
          fullVideoName: item.full_video_name,
          fileKey: item.file_key_to_s3,
          s3Url: signedUrl,
          meetingNum: item.meeting_num,
          roomNum: item.room_num,
          cameraName: item.camera_name,
          therapistCode: item.therapist_code,
          patientCode: item.patient_code,
          lastModified: metadata ? metadata.LastModified : 'Unknown',
        };
      }));

      setVideos(videoList);

      
      return videoList;
    } catch (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
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
  
    {!selectedInstructor && (
        <div className="list-wrap instructors">
          <h1>Instructors List</h1>
          <ul>
            {instructors.map((instructor) => (
              <li key={instructor} onClick={() => handleInstructorClick(instructor)} className='item'>
                <div className="folder-img"></div>
                <span>{instructor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
  
      {selectedInstructor && !selectedStudent && (
        <div className="list-wrap students">
          <h2>Students under {selectedInstructor}</h2>
          <ul>
            {students.map((student) => (
              <li key={student} onClick={() => handleStudentClick(student)} className='item'>
                <div className="folder-img"></div> 
                <span>{student}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
  
      {selectedStudent && !selectedPatient && (
        <div className="list-wrap patients">
          <h2>Patients for {selectedStudent}</h2>
          <ul>
            {patients.map((patientCode) => (
              <li key={patientCode} onClick={() => handlePatientClick(patientCode)} className='item'>
                <div className="folder-img"></div>
                <span>Patient Code: {patientCode}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
  
      {selectedPatient && (
        <div className="list-wrap videos">
          <h2>Videos for {selectedPatient}</h2>
          <ul>
            {videos.filter(video => video.patientCode === selectedPatient).map((video, index) => (
              <li key={video.videoId || index} onClick={() => setSelectedVideo(video)} className='item'>
                <div className="folder-img"></div> 
                <div className="video-details">
                  <dl>
                    {video.fullVideoName && (
                      <div className='detail'>
                        <dt>Video Name:</dt>
                        <dd>{video.fullVideoName}</dd>
                      </div>
                    )}
                    {video.meetingNum && (
                      <div className='detail'>
                        <dt>Meeting Number:</dt>
                        <dd>{video.meetingNum}</dd>
                      </div>
                    )}
                    {video.roomNum && (
                      <div className='detail'>
                        <dt>Room Number:</dt>
                        <dd>{video.roomNum}</dd>
                      </div>
                    )}
                    {video.cameraName && (
                      <div className='detail'>
                        <dt>Camera Name:</dt>
                        <dd>{video.cameraName}</dd>
                      </div>
                    )}
                    {video.therapistCode && (
                      <div className='detail'>
                        <dt>Therapist Code:</dt>
                        <dd>{video.therapistCode}</dd>
                      </div>
                    )}
                    {video.patientCode && (
                      <div className='detail'>
                        <dt>Patient Code:</dt>
                        <dd>{video.patientCode}</dd>
                      </div>
                    )}
                    {video.lastModified && (
                      <>
                        <div className='detail'>
                          <dt>Upload Date:</dt>
                          <dd>{new Date(video.lastModified).toLocaleDateString()}</dd>
                        </div>
                        <div className='detail'>
                          <dt>Upload Time:</dt>
                          <dd>{new Date(video.lastModified).toLocaleTimeString()}</dd>
                        </div>
                      </>
                    )}
                  </dl>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
  
      {selectedVideo && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setSelectedVideo(null)}>&times;</span>
            <h3>{selectedVideo.fullVideoName}</h3>
            <iframe
              width="560"
              height="315"
              src={selectedVideo.s3Url}
              title={selectedVideo.fullVideoName}
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default HomePage;

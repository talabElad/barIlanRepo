import React, { useEffect } from 'react';

const VideoModal = ({ selectedVideo, setSelectedVideo, groupedVideos, selectedSession, activeTab, setActiveTab, handleTimeUpdate }) => {
  

  useEffect(() => {
    if (groupedVideos[selectedSession] && groupedVideos[selectedSession].length > 0) {
      setActiveTab(groupedVideos[selectedSession][0].fullVideoName);
    }
  }, [selectedVideo, groupedVideos, selectedSession, setActiveTab]);


    if (!selectedVideo) return null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={() => setSelectedVideo(null)}>&times;</span>
        <div className="tabs">
          {groupedVideos[selectedSession]?.map((video) => (
            <button
              key={video.fileKey}
              className={video.fullVideoName === activeTab ? 'active' : ''}
              onClick={() => handleTabChange(video.fullVideoName)}
            >
              {video.fullVideoName}
            </button>
          ))}
        </div>
        <div className="tab-content">
          {groupedVideos[selectedSession]?.map((video) => (
            video.fullVideoName === activeTab && (
              <div key={video.fileKey}>
                {video.s3Url ? (
                  <>
                    <video width="560" height="315" src={video.s3Url} controls onTimeUpdate={(e) => handleTimeUpdate(video.fileKey, e.target.currentTime)}></video>
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoModal;

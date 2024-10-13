import React from 'react';

const VideosList = ({ groupedVideos, onVideoClick }) => (
  <div className="list-wrap videos">
    <h2>Videos</h2>
    <ul>
      {Object.entries(groupedVideos).map(([sessionName, sessionVideos]) => (
        <li key={sessionName}>
          <h3>{sessionName}</h3>
          <ul>
            {sessionVideos.map((video) => (
              
              <li key={video.fileKey} onClick={() => onVideoClick(video)} className='item'>
                <div className="folder-img"></div>
                <div className="video-details">
                  <dl>
                    <div className='detail'>
                      <dt>Video Name:</dt>
                      <dd>{video.fullVideoName}</dd>
                    </div>
                    <div className='detail'>
                      <dt>Last Modified:</dt>
                      <dd>{new Date(video.lastModified).toLocaleDateString('he-IL')}</dd>
                    </div>
                  </dl>
                </div>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  </div>
);

export default VideosList;

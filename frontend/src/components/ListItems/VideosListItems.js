import React from 'react';

const VideosListItems = ({ videos = [], onVideoClick }) => (
  
    <ul>
      {
        videos.map((video) => (
          <li key={`${video.uniqueSessionName}-${video.fileKey}`} onClick={() => onVideoClick(video.patientCode, video)} className='item'>
            <div className="folder-img"></div>
            <div className="video-details">
              <dl>
                <div className='detail'>
                  <dt>Patient Code:</dt>
                  <dd>{video.patientCode}</dd>
                </div>
                <div className='detail'>
                  <dt>Session Name:</dt>
                  <dd>{video.uniqueSessionName}</dd>
                </div>
                {video.date && video.date !== 'unknown' && (
                  <div className='detail'>
                    <dt>Date:</dt>
                    <dd>{new Date(video.date).toLocaleDateString('he-IL')}</dd>
                  </div>
                )}
              </dl>
            </div>
          </li>
        ))
      }
    </ul>
    
);

export default VideosListItems;





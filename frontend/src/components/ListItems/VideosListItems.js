import React from 'react';

const VideosListItems = ({ videos = [], onVideoClick }) => (
  
    <ul>
      {videos.length > 0 ? (
        videos.map((video) => (
          <li key={`${video.fullVideoName}-${video.fileKey}`} onClick={() => onVideoClick(video.patientCode, video)} className='item'>
            <div className="folder-img"></div>
            <div className="video-details">
              <dl>
                <div className='detail'>
                  <dt>Video Name:</dt>
                  <dd>{video.fullVideoName}</dd>
                </div>
                {video.lastModified && video.lastModified !== 'unknown' && (
                  <div className='detail'>
                    <dt>Last Modified:</dt>
                    <dd>{new Date(video.lastModified).toLocaleDateString('he-IL')}</dd>
                  </div>
                )}
              </dl>
            </div>
          </li>
          
        ))
      ) : (
        <li>No videos available</li>
      )}
    </ul>
    
);

export default VideosListItems;





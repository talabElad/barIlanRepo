import React from 'react';

const VideoGrid = ({ videos }) => {
  return (
    <div className="video-grid">
      {videos.map((video, index) => (
        <div key={index} className="video-item">
          <h3>{video.title}</h3>
          <video controls>
            <source src={video.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;


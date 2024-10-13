import React, { useState } from 'react';

const VideosList = ({ groupedVideos, onVideoClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Function to filter videos by date range
  const filterByDateRange = (lastModified) => {
    if (!dateFrom || !dateTo) return true;
    const modifiedDate = new Date(lastModified);
    return modifiedDate >= new Date(dateFrom) && modifiedDate <= new Date(dateTo);
  };

  // Filtered videos by search term and date range
  const filteredVideos = Object.entries(groupedVideos).map(([sessionName, sessionVideos]) => ({
    sessionName,
    videos: sessionVideos.filter(video =>
      video.fullVideoName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      filterByDateRange(video.lastModified)
    ),
  })).filter(group => group.videos.length); // Ensure non-empty groups

  return (
    <div className="list-wrap videos">
      <h2>Videos</h2>
      {/* Search inputs */}
      <input 
        type="text" 
        placeholder="Search Videos by Name..." 
        value={searchTerm} 
        onChange={e => setSearchTerm(e.target.value)} 
      />
      <div>
        <label>From: </label>
        <input 
          type="date" 
          value={dateFrom} 
          onChange={(e) => setDateFrom(e.target.value)} 
        />
        <label>To: </label>
        <input 
          type="date" 
          value={dateTo} 
          onChange={(e) => setDateTo(e.target.value)} 
        />
      </div>

      {/* Render filtered videos */}
      <ul>
        {filteredVideos.map(({ sessionName, videos }) => (
          <li key={sessionName}>
            <h3>{sessionName}</h3>
            <ul>
              {videos.map((video) => (
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
};

export default VideosList;

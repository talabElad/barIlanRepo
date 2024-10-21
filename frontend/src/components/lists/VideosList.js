import React, { useState } from 'react';
import VideosListItems from '../ListItems/VideosListItems';

const VideosList = ({ groupedVideos, onClickFromAdminVideo, onClickFromHomeVideo }) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');


  if (!groupedVideos || Object.keys(groupedVideos).length === 0) {
    return <div>No videos found</div>;
  }

  // Function to filter videos by date range
  const filterByDateRange = (lastModified) => {
    if (!dateFrom || !dateTo) return true;
    const modifiedDate = new Date(lastModified);
    return modifiedDate >= new Date(dateFrom) && modifiedDate <= new Date(dateTo);
  };

  
  // Filtered videos by search term and date range
  const filteredVideos = Object.entries(groupedVideos).map(([sessionName, sessionVideos]) => {
    // Ensure sessionVideos is an array before filtering
    const videosArray = Array.isArray(sessionVideos) ? sessionVideos : [];

    const filtered = videosArray.filter(video => {
      const passesSearch = video?.fullVideoName?.toLowerCase().includes(searchTerm.toLowerCase());
      const passesDate = filterByDateRange(video.lastModified);
      return passesSearch && passesDate;
    });

    return {
      sessionName,
      videos: filtered
    };
  }).filter(group => group.videos.length > 0);



  const handleVideoClick = (patientCode, video) => {
    // Call the relevant handler based on where the click originated
    if (onClickFromAdminVideo) {
      onClickFromAdminVideo(patientCode, video);
    }
    if (onClickFromHomeVideo) {
      onClickFromHomeVideo(patientCode);
    }
  };


  return (
    <div className="list-wrap videos">
      <div className='title-wrap'>
        <h2>Videos</h2>
        <span>({filteredVideos[0]['videos'].length})</span>
      </div>

      <div className='search-container'>
        <div className='free-text-item'>
          <label htmlFor="freeText"></label>
          <input type="text" id="freeText" className='free-text' placeholder="Search session..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className='dates-wrap'>
          <div className='date-item'>
            <label htmlFor="fromDate">From: </label>
            <input type="date" id="fromDate" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className='date-item'>
            <label htmlFor="toDate">To: </label>
            <input type="date" id="toDate" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>
      {searchTerm && filteredVideos.length !== Object.keys(groupedVideos).length && (
        <div className='filter-status'><p>Shown Filtered Results</p></div>
      )}
      <ul>
      {filteredVideos.map(({ sessionName, videos }) => (
        
        <li key={sessionName}>
          <h3>{sessionName}</h3>
          
          <VideosListItems videos={videos} onVideoClick={handleVideoClick} />
        </li>
      ))}
      </ul>
    </div>
  );
};

export default VideosList;

import React, { useState } from 'react';
import VideosListItems from '../ListItems/VideosListItems';

const VideosList = ({ groupedVideos, onClickFromAdminVideo, onClickFromHomeVideo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Function to filter videos by date range
  const filterByDateRange = (lastModified) => {
    if (!dateFrom || !dateTo) return true;
    const modifiedDate = new Date(lastModified);
    return modifiedDate >= new Date(dateFrom) && modifiedDate <= new Date(dateTo);
  };

  console.log('groupedVideos: ', groupedVideos)
  
// Filtered videos by search term and date range
const filteredVideos = groupedVideos ? Object.entries(groupedVideos).map(([sessionName, sessionVideos]) => ({
  sessionName,
  videos: sessionVideos.filter(video =>
    video.fullVideoName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    filterByDateRange(video.lastModified)
  ),
})).filter(group => group.videos.length) : [];



  const handleVideoClick = (patientCode) => {
    // Call the relevant handler based on where the click originated
    if (onClickFromAdminVideo) {
      onClickFromAdminVideo(patientCode);
    }
    if (onClickFromHomeVideo) {
      onClickFromHomeVideo(patientCode);
    }
  };


  return (
    <div className="list-wrap videos">
      <div className='title-wrap'>
        <h2>Videos</h2>
        <span>({filteredVideos.length})</span>
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
      {searchTerm && filteredVideos.length !== groupedVideos.length && (
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

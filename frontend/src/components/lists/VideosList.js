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
  const filterByDateRange = (lastModified = null) => {
    if (!dateFrom || !dateTo) return true;
    if (lastModified === 'Unknown') return true;
  
    const modifiedDate = parseDate(lastModified);
    const fromDate = parseDate(dateFrom);
    const toDate = parseDate(dateTo);
  
    if (!modifiedDate) return true;

    return modifiedDate >= fromDate && modifiedDate <= toDate;
  };
  
  // Utility function to handle different date formats
  const parseDate = (dateStr) => {
    const parsedDate = Date.parse(dateStr);
    if (isNaN(parsedDate)) {
      // Assume the date format is DD-MM-YYYY, try converting it
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return new Date(`${year}-${month}-${day}`);
      }
      return null;
    }
    return new Date(parsedDate);
  };

  // Filtered videos by search term and date range
  const filteredVideos = Object.entries(groupedVideos).map(([sessionName, sessionVideos]) => {
    // Ensure sessionVideos is an array before filtering
    const videosArray = Array.isArray(sessionVideos) ? sessionVideos : [];

    const filtered = videosArray.filter(video => {
      const passesSearch = video?.fullVideoName?.toLowerCase().includes(searchTerm.toLowerCase());
      const passesDate = filterByDateRange(video.date);
      return passesSearch && passesDate;
    });

    return {
      sessionName,
      videos: filtered
    };
  }).filter(group => group.videos.length > 0);

  // Handle case where no videos match the filters
  const noResultsFound = filteredVideos.length === 0;

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
        <span>({filteredVideos[0]?.videos.length || 0})</span>
      </div>

      <div className='search-container'>
        <div className='free-text-item'>
          <label htmlFor="freeText"></label>
          <input
            type="text"
            id="freeText"
            className='free-text'
            placeholder="Search session..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className='dates-wrap'>
          <div className='date-item'>
            <label htmlFor="fromDate">From: </label>
            <input
              type="date"
              id="fromDate"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className='date-item'>
            <label htmlFor="toDate">To: </label>
            <input
              type="date"
              id="toDate"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {noResultsFound ? (
        <p>No results found for your search criteria.</p>
      ) : (
        <>
          {searchTerm && filteredVideos.length !== Object.keys(groupedVideos).length && (
            <div className='filter-status'><p>Shown Filtered Results</p></div>
          )}
          <ul>

          {filteredVideos.length > 0 ? (
            filteredVideos.map(({ sessionName, videos }) => (
              <li key={sessionName}>
                <h3>{sessionName}</h3>
                <VideosListItems videos={videos} onVideoClick={handleVideoClick} />
              </li>
            ))
          ) : (
            <div>No videos found</div>
          )}

          </ul>
        </>
      )}
    </div>
  );
};

export default VideosList;

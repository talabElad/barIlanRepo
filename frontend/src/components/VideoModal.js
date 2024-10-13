// import React from 'react';
// import PropTypes from 'prop-types';

// const VideoModal = ({ selectedVideo, setSelectedVideo, groupedVideos, activeTab, setActiveTab }) => {
  
//   return (
//     <div className="modal">
//       <div className="modal-content">
//         <span className="close" onClick={() => setSelectedVideo(null)}>&times;</span>
//         <div className="tabs">
//           {groupedVideos.map((video) => (
//             <button
//               key={video.fileKey}
//               className={video.fullVideoName === activeTab ? 'active' : ''}
//               onClick={() => setActiveTab(video.fullVideoName)}
//             >
//               {video.fullVideoName}
//             </button>
//           ))}
//         </div>
//         <div className="tab-content">
//           {groupedVideos.map((video) => (
//             video.fullVideoName === activeTab && (
//               <div key={video.fileKey}>
//                 {video.s3Url ? (
//                   <>
//                     <video
//                       width="560"
//                       height="315"
//                       src={video.s3Url}
//                       controls
//                       // Add the onTimeUpdate handler if needed
//                     ></video>
//                     <div className="video-details">
//                       <h4>Video Details:</h4>
//                       <dl>
//                         <div className='detail'>
//                           <dt>Room Number:</dt>
//                           <dd>{video.roomNum}</dd>
//                         </div>
//                         <div className='detail'>
//                           <dt>Meeting Number:</dt>
//                           <dd>{video.meetingNum}</dd>
//                         </div>
//                         <div className='detail'>
//                           <dt>Patient Code:</dt>
//                           <dd>{video.patientCode}</dd>
//                         </div>
//                       </dl>
//                       <dl>
//                         <div className='detail'>
//                           <dt>Last Modified:</dt>
//                           <dd>{video.lastModified[0]}</dd>
//                         </div>
//                         <div className='detail'>
//                           <dt>Therapist Code:</dt>
//                           <dd>{video.therapistCode}</dd>
//                         </div>
//                         <div className='detail'>
//                           <dt>Unique Session Name:</dt>
//                           <dd>{video.uniqueSessionName}</dd>
//                         </div>
//                       </dl>
//                     </div>
//                   </>
//                 ) : (
//                   <p>Video not available.</p>
//                 )}
//               </div>
//             )
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// VideoModal.propTypes = {
//   selectedVideo: PropTypes.string,
//   setSelectedVideo: PropTypes.func.isRequired,
//   groupedVideos: PropTypes.array.isRequired,
//   activeTab: PropTypes.string.isRequired,
//   setActiveTab: PropTypes.func.isRequired,
// };

// export default VideoModal;

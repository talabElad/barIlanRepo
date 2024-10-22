import { useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { groupVideosBySession } from '../utils/videoUtils';

const useVideos = () => {
  const [videoList, setVideos] = useState([]);
  const [groupedVideos, setGroupedVideos] = useState({});
  const [loading, setLoading] = useState(false); // Add a loading state for better UX
  const [error, setError] = useState(null); // Add an error state

  const fetchVideos = async (patientCode = null) => {
    setLoading(true);
    setError(null);

    try {
      const token = (await fetchAuthSession()).tokens?.idToken?.toString();
      const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;
      const fullUrl = `${apiUrl}/fetchvideos?patientCode=${patientCode}`;

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.statusText}`);
      }

      const data = await response.json();
      const videoList = data.unique_videos_list.map((item) => ({
        fullVideoName: item.fullVideoName,
        fileKey: item.fileKey,
        s3Url: item.s3Url, // S3 signed URL for video access
        meetingNum: item.meetingNum,
        roomNum: item.roomNum,
        cameraName: item.cameraName,
        therapistCode: item.therapistCode,
        patientCode: item.patientCode,
        uniqueSessionName: item.uniqueSessionName,
        date: item.date,
        time: item.time,
      }));

      setVideos(videoList);
      console.log('Fetched videos:', videoList);

      // Assuming you have a utility to group videos by session
      const grouped = groupVideosBySession(videoList);
      setGroupedVideos(grouped);
      
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError(error.message); // Capture any errors for display
    } finally {
      setLoading(false);
    }
  };

  return { videoList, fetchVideos, groupedVideos, loading, error };
};

export default useVideos;

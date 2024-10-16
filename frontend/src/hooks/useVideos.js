import { useState } from 'react';
import dynamoDB from '../aws/awsConfig';
import { groupVideosBySession } from '../utils/videoUtils';
import { getVideoMetadata } from '../utils/getVideoMetadata';
import { getSignedUrl } from '../utils/getSignedUrl';

const useVideos = () => {
  const [videoList, setVideos] = useState([]);
  const [groupedVideos, setGroupedVideos] = useState({});

  const fetchVideos = async (patientCode) => {
    const params = {
      TableName: 'BarIlanSessionsFiles',
      FilterExpression: 'patient_code = :patientCode',
      ExpressionAttributeValues: {
        ':patientCode': patientCode,
      },
    };

    try {
      const data = await dynamoDB.scan(params).promise();
      const videoList = await Promise.all(data.Items.map(async (item) => {
        const metadata = await getVideoMetadata(item.file_key_to_s3);
        const signedUrl = await getSignedUrl(item.file_key_to_s3);

        return {
          fullVideoName: item.full_video_name,
          fileKey: item.file_key_to_s3,
          s3Url: signedUrl,
          meetingNum: item.meeting_num,
          roomNum: item.room_num,
          cameraName: item.camera_name,
          therapistCode: item.therapist_code,
          patientCode: item.patient_code,
          uniqueSessionName: item.unique_session_name,
          lastModified: metadata ? metadata.LastModified : 'Unknown',
        };
        
      }));

      
      setVideos(videoList);
      console.log('Fetched videos:', videoList);
      const grouped = groupVideosBySession(videoList);
      setGroupedVideos(grouped);

    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  return { videoList, fetchVideos, groupedVideos };
};

export default useVideos;

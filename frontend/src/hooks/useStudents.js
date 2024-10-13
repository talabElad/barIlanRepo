// useStudents.js
import { useState } from 'react';
import dynamoDB from '../aws/awsConfig';

const useStudents = () => {
  const [students, setStudents] = useState([]);

  const fetchStudents = async (therapistCodeLeader) => {
    const params = {
      TableName: 'BarIlanGuidanceTree',
      KeyConditionExpression: 'therapist_code_leader = :leaderCode',
      ExpressionAttributeValues: {
        ':leaderCode': therapistCodeLeader,
      },
    };

    try {
      const data = await dynamoDB.query(params).promise();
      const studentCodes = data.Items.map(item => item['therapist_code_student ']);
      setStudents(studentCodes);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  return { students, fetchStudents };
};

export default useStudents;

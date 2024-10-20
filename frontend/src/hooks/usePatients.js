import { useState } from 'react';
import dynamoDB from '../aws/awsConfig';

const usePatients = () => {
  const [patients, setPatients] = useState([]);

  const fetchPatients = async (therapistCodeStudent) => {
    const params = {
        TableName: 'BarIlanTherapistPatients',
        KeyConditionExpression: 'therapist_code = :studentCode',
        ExpressionAttributeValues: {
          ':studentCode': therapistCodeStudent.trim(),
        },
      };
    
      try {
        const data = await dynamoDB.query(params).promise();
        const patientCodes = data.Items.map(item => item.patient_code) || [];
        const uniquePatients = [...new Set(patientCodes)];
        setPatients(uniquePatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
  };

  return { patients, fetchPatients };
};

export default usePatients;

import { useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

const usePatients = () => {
  const [patients, setPatients] = useState([]);

  const fetchPatients = async (therapistCodeStudent) => {


    try {
      const token = (await fetchAuthSession()).tokens?.idToken?.toString();
      const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;
      const fullUrl = `${apiUrl}/fetchpatients?therapistCodeStudent=${therapistCodeStudent}`;

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }

      const data = await response.json();

      const patientCodes = data.unique_patients_codes || [];
      setPatients(patientCodes);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }


  };

  return { patients, fetchPatients };
};

export default usePatients;

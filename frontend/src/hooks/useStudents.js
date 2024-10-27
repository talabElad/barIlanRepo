import { useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

const useStudents = () => {
  const [students, setStudents] = useState([]);

  const fetchStudents = async (therapistCodeLeader = '') => {
    try {
      const token = (await fetchAuthSession()).tokens?.idToken?.toString();
      const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;

      const fullUrl = `${apiUrl}/fetchstudents?therapistCodeLeader=${therapistCodeLeader}`;

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      console.log('response:', response);

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      console.log('Fetched students data:', data);

      const studentCodes = data.unique_student_codes || [];
      setStudents(studentCodes);

      if (studentCodes.length === 0) {
        console.warn(`No students found for therapistCodeLeader: ${therapistCodeLeader}`);
      }

    } catch (error) {
      console.error('Error fetching students for therapistCodeLeader:', therapistCodeLeader, error);
    }
  };

  return { students, fetchStudents };
};

export default useStudents;

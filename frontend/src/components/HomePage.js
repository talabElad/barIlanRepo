import React from 'react';
import '../style/HomePage.scss';

const HomePage = ({ isAuthenticated, userRole }) => {
  if (!isAuthenticated) {
    return <div>You are not authorized to view this page. Redirecting...</div>;
  }

  let permissionType;
  let permissionName;

  if (userRole.includes('Admins')) {
    permissionType = 1;
    permissionName = 'Admin';
  } else if (userRole.includes('Instructors')) {
    permissionType = 2;
    permissionName = 'Instructor';
  } else if (userRole.includes('Students')) {
    permissionType = 3;
    permissionName = 'Student';
  } else {
    permissionType = 0;
    permissionName = 'None';
  }

  return (
    <div className="main-container homepage">
      <h1>Welcome to the homepage!</h1>
      <p>Your permission type: {permissionType}</p>
      <p>Your permission name: {permissionName}</p>
    </div>
  );

};

export default HomePage;

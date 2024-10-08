import React from 'react';

const HomePage = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    return <div>You are not authorized to view this page. Redirecting...</div>;
  }

  return <div>Welcome to the homepage!</div>;
};

export default HomePage;

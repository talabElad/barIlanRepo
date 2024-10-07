import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import './style/global.scss';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import HomePage from './components/HomePage';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <InnerApp isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
    </Router>
  );
};

// Separate component to handle routing and navigation
const InnerApp = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate(); // useNavigate must be inside a component that is a child of Router

  const handleAuthToggle = () => {
    if (isAuthenticated) {
      setIsAuthenticated(false); 
      console.log("User logged out");
      navigate('/'); // Navigate to root (login) after logout
    } else {
      setIsAuthenticated(true);
      console.log("User logged in");
      navigate('/homepage');
    }
  };

  return (
    <main>
      <Header isAuthenticated={isAuthenticated} onLogout={handleAuthToggle} />
      <Routes>
        <Route path="/" element={<Login onLogin={handleAuthToggle} />} />
        <Route path="/homepage" element={<HomePage isAuthenticated={isAuthenticated} />} />
      </Routes>
      <Footer />
    </main>
  );
};


export default App;

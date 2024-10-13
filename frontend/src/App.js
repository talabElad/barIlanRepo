import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './style/global.scss';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import HomePage from './components/HomePage';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          
          const session = await fetchAuthSession();
          
          // Log token details
          if (session && session.tokens) {
            // console.log("Access Token:", session.tokens.accessToken);
            // console.log("ID Token:", session.tokens.idToken);
            // console.log("Refresh Token:", session.tokens.refreshToken);
            // console.log("user: ", session.tokens.idToken.payload.name);
            // console.log("groups: ", session.tokens.idToken.payload['cognito:groups']);

            setUserName(session.tokens.idToken.payload.name);
            setUserRole(session.tokens.idToken.payload['cognito:groups']);
          }
          
          setIsAuthenticated(true);
          
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <main>
        <Header isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} userName={userName} />
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/homepage" /> : <Login />} />
          <Route
            path="/homepage"
            element={isAuthenticated ? <HomePage isAuthenticated={isAuthenticated} userRole={userRole} /> : <Navigate to="/" />}
          />
        </Routes>
        <Footer />
      </main>
    </Router>
  );
};

export default App;

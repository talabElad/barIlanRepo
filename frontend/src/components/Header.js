import React from 'react';
import { signInWithRedirect, signOut } from 'aws-amplify/auth';
import { Link } from 'react-router-dom';
import '../style/Header.scss'; // Adjust your styles accordingly

const Header = ({ isAuthenticated, onLogout, userName, userRole }) => {
  const handleLogin = async () => {
    try {
      await signInWithRedirect(); // Redirect to Cognito for authentication
      console.log("Login successful, user redirected to /homepage");
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(); // Sign out the user directly using Auth module
      onLogout(); // Call the logout handler passed as a prop
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header>
      <div className="auth-wrap">
        {isAuthenticated ? (
          <div className='inner'>
            <button onClick={handleLogout}>Logout</button>
            <span>Welcome, {userName}</span>
          </div>
        ) : (
          <div className='inner'>
            <button onClick={handleLogin}>Login</button>
          </div>
        )}
      </div>
      <div className='logo'>
        <img src='../../images/bar-ilan-logo.png' alt='Logo' />
      </div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          {/* {userRole && userRole.includes('Admins') && (
            <li><Link to="/admin-search">Admin Search</Link></li>
          )} */}
        </ul>
      </nav>
    </header>
  );
};

export default Header;

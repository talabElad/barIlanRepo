import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify'; 
import awsmobile from '../aws-exports';
import '../style/Header.scss';

Amplify.configure(awsmobile);

const Header = ({ isAuthenticated }) => {
  const navigate = useNavigate();

  const handleLoginLogout = async () => {
    if (isAuthenticated) {
      // User is logged in, handle logout
      await Amplify.Auth.signOut(); // Sign out from Cognito
      console.log("User logged out");
      navigate('/'); // Navigate to root (login) after logout
    } else {
      // User is not logged in, redirect to login
      window.location.href = awsmobile.oauth.redirectSignIn; // Redirect to the Cognito hosted UI
    }
  };

  return (
    <header>
      <nav>
        <ul>
          <li><Link to="/">Link example</Link></li>
        </ul>
      </nav>
      <div className='logo'>
        <img src='../../images/bar-ilan-logo.png' alt='Logo' />
      </div>
      <div className="logout">
        <button onClick={handleLoginLogout}>
          {isAuthenticated ? 'Logout' : 'Login'}
        </button>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { useHistory } from 'react-router-dom';

const LogoutSuccess = () => {
  const history = useHistory();

  return (
    <div className="logout-success">
      <div className="success-content">
        <div className="success-icon">✓</div>
        <h2>Signed out of all devices successfully</h2>
        <p>If you'd like to sign back in, go to the landing page by clicking the button below.</p>
        <button 
          onClick={() => history.push('/')} 
          className="auth-button"
        >
          Go to landing page
        </button>
      </div>
    </div>
  );
};

export default LogoutSuccess; 
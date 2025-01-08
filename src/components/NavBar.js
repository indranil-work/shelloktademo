import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { NavLink, useLocation, useHistory } from "react-router-dom";
import headerIcon from '../assets/header-icon.png';
import { useUser } from '../context/UserContext';

const NavBar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { selectedLocale, setSelectedLocale, selectedJourney, getClientConfig } = useUser();
  const { 
    isAuthenticated, 
    loginWithRedirect, 
    logout,
    user 
  } = useAuth0();
  const location = useLocation();
  const history = useHistory();
  const isProfilePage = location.pathname === '/profile';

  // Get display name from user object
  const displayName = user?.name || user?.nickname || user?.given_name || user?.email?.split('@')[0];

  const handleLogin = async () => {
    const config = getClientConfig();
    alert(`Selected locale: ${selectedLocale}\nSelected journey: ${selectedJourney}\nUsing clientId: ${config.clientId}`);
    
    await loginWithRedirect({
      authorizationParams: {
        ui_locales: selectedLocale
      }
    });
  };

  if (isProfilePage) {
    return (
      <nav className="navbar">
        <div className="nav-left">
          <img src={headerIcon} alt="Shell Logo" className="shell-logo" />
        </div>

        <div className="nav-right">
          <button 
            className="back-to-app-btn"
            onClick={() => history.push('/')}
          >
            Back to App
          </button>
          {isAuthenticated && (
            <div className="user-profile">
              <div className="user-avatar">
                <span className="avatar-initials">
                  {displayName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="user-name">{displayName}</span>
            </div>
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        {isAuthenticated ? (
          <>
            <div className="user-profile">
              <div className="user-avatar">
                <img src={user?.picture || "https://shell-cipm-demo.eu.nextreason.com/assets/profile.png"} alt="avatar" />
              </div>
              <div className="user-info">
                <div 
                  className="user-name-wrapper" 
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span>{displayName}</span>
                  <span className="dropdown-arrow">▾</span>
                </div>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <button 
                      className="sign-out-btn"
                      onClick={() => {
                        setShowDropdown(false);
                        logout({ returnTo: window.location.origin });
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <button 
            className="login-btn"
            onClick={handleLogin}
          >
            LOGIN
          </button>
        )}
      </div>

      <div className="logo-container">
        <img src={headerIcon} alt="Shell Logo" className="shell-logo" />
      </div>

      <div className="locale-wrapper">
        <span>Locale</span>
        <select 
          value={selectedLocale} 
          onChange={(e) => setSelectedLocale(e.target.value)} 
          className="locale-select"
        >
          <option value="en-US">en-US</option>
          <option value="de">de-DE</option>
        </select>
      </div>
    </nav>
  );
};

export default NavBar;

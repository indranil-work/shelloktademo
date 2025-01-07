import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { NavLink } from "react-router-dom";
import headerIcon from '../assets/header-icon.png';
import { useUser } from '../context/UserContext';

const NavBar = () => {
  const { selectedLocale, setSelectedLocale, selectedJourney } = useUser();
  const { 
    isAuthenticated, 
    loginWithRedirect, 
    logout 
  } = useAuth0();

  const handleLogin = () => {
    alert(`Selected locale: ${selectedLocale}\nSelected journey: ${selectedJourney}`);
    loginWithRedirect();
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        {isAuthenticated ? (
          <>
            <NavLink 
              to="/profile" 
              className="nav-link"
              activeClassName="nav-link-active"
            >
              Profile
            </NavLink>
            <button 
              className="logout-btn"
              onClick={() => logout({ returnTo: window.location.origin })}
            >
              Log Out
            </button>
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
          <option value="de-DE">de-DE</option>
        </select>
      </div>
    </nav>
  );
};

export default NavBar;

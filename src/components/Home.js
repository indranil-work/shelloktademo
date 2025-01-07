import React from "react";
// Import the images - make sure the path matches your actual file names
import backgroundBottom from '../assets/background-bottom.png';
// If you have the right image, uncomment the next line
import backgroundRight from '../assets/background-right.png';
import { useAuth0 } from "@auth0/auth0-react";

const Home = () => {

  const { 
    isAuthenticated, 
    loginWithRedirect, 
    logout 
  } = useAuth0();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to the Shell CIPM Demo Hub!</h1>
        <p className="description">
          This demo application will let you test the various features and user journeys 
          of the CIPM Customer Identity Journeys. Select a user journey in the dropdown 
          to get started
        </p>
        
        <div className="journey-selector">
          <label>Select a user journey</label>
          <select defaultValue="">
            <option value="">Email/Password with Self-registration (U)</option>
          </select>
        </div>

        <button className="get-started-button" onClick={() => loginWithRedirect()}>GET STARTED</button>
      </div>
      <div className="decorative-image" 
           style={{ backgroundImage: `url(${backgroundRight})` }}>
      </div>
      <div className="wave-background" 
           style={{ backgroundImage: `url(${backgroundBottom})` }}>
      </div>
    </div>
  );
};

export default Home; 
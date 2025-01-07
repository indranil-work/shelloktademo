import React from "react";
import waveImage from '../assets/background-bottom.png';
import decorativeImage from '../assets/background-right.png';
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from '../context/UserContext';

const Home = () => {
  const { selectedJourney, setSelectedJourney, selectedLocale } = useUser();
  const { loginWithRedirect } = useAuth0();

  const handleGetStarted = () => {
    if (!selectedJourney) {
      alert("Please select a journey first");
      return;
    }
    alert(`Selected locale: ${selectedLocale}\nSelected journey: ${selectedJourney}`);
    loginWithRedirect();
  };

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1>
          Welcome to the Shell<br />
          CIPM Demo Hub!
        </h1>
        
        <p>
          This demo application will let you test the various features<br />
          and user journeys of the CIPM Customer Identity Journeys.<br />
          Select a user journey in the dropdown to get started
        </p>

        <div className="journey-selector">
          <label>Select a user journey</label>
          <select 
            value={selectedJourney}
            onChange={(e) => setSelectedJourney(e.target.value)}
            name="journeyOptions" 
            id="journey-options"
          >
            <option value="email1">Email/Password with Self-registration (U)</option>
            <option value="email2">Email/Password with Self-registration</option>
          </select>
        </div>

        <button className="start-btn" onClick={handleGetStarted}>
          GET STARTED
        </button>
      </div>
      
      <img src={decorativeImage} alt="" className="decorative-image" />
      <img src={waveImage} alt="" className="wave-image" />
    </div>
  );
};

export default Home; 
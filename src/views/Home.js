import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import waveImage from '../assets/background-bottom.png';
import decorativeImage from '../assets/background-right.png';
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from '../context/UserContext';

const Home = () => {
  const { selectedJourney, setSelectedJourney, selectedLocale, getClientConfig } = useUser();
  const { loginWithRedirect, isAuthenticated, user } = useAuth0();
  const history = useHistory();
  const { search } = useLocation();
  const parsedSearch = new URLSearchParams(search);

  if(parsedSearch.has('error')){
    alert(`Oops... ${parsedSearch.get('error_description')} - redirecting back to login`);
    history.push(`/login?journey=${selectedJourney}`);
  }

  const handleGetStarted = async () => {
    if (!selectedJourney) {
      alert("Please select a journey first");
      return;
    }
    const config = getClientConfig();
    alert(`Selected locale: ${selectedLocale}\nSelected journey: ${selectedJourney}\nUsing clientId: ${config.clientId}`);
    
    await loginWithRedirect({
      authorizationParams: {
        ui_locales: selectedLocale
      }
    });
  };

  if (isAuthenticated) {
    return (
      <div className="landing-page">
        <div className="landing-content">
          <h1>
            You're Logged In!
          </h1>
          
          <p>
            Navigate to your profile to edit your details, change a<br />
            password, and/or view other options
          </p>

          <button 
            className="profile-btn" 
            onClick={() => history.push('/profile')}
          >
            GO TO MY PROFILE
          </button>
        </div>
        
        <img src={decorativeImage} alt="" className="decorative-image" />
        <img src={waveImage} alt="" className="wave-image" />
      </div>
    );
  }

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
            <option value="email1">Email/Password with Self-registration</option>
            <option value="2sv_optional">Email/Password Self-registration - 2SV optional</option>
            <option value="2sv_mandatory">Email/Password Self-registration - 2SV mandatory</option>
            <option value="sniper_link">Email/Password Self-registration - sniper link verification</option>
            <option value="sms_otp">Mobile number & OTP</option>
            <option value="phone_password">Mobile number & password</option>
            <option value="email_password_authenticator">Email/Password with Authenticator</option>
            <option value="mobile_password_authenticator">Mobile #/Password with Authenticator</option>
            <option value="mobile_otp_authenticator">Mobile #/OTP with Authenticator</option>
            <option value="email_passkey">Passwordless (Biometrics) - Email</option>
            <option value="mobile_passkey">Passwordless (Biometrics) - Mobile</option>
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
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import waveImage from '../assets/background-bottom.png';
import decorativeImage from '../assets/background-right.png';
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from '../context/UserContext';

const Home = () => {
  const { selectedJourney, setSelectedJourney, selectedLocale, getClientConfig } = useUser();
  const { loginWithRedirect, isAuthenticated, user } = useAuth0();
  const history = useHistory();
  const { search, hash } = useLocation();
  const parsedSearch = new URLSearchParams(search);
  const CACHE_KEY_PREFIX = '@@auth0spajs@@';

  const decodeB64 = (input) => {
    return decodeURIComponent(
      atob(input)
        .split('')
        .map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  }
  const urlDecodeB64 = (input) => {
    return decodeB64(input.replace(/_/g, '/').replace(/-/g, '+'));
  }
    

  const idTokendecoded = [
    'iss',
    'aud',
    'exp',
    'nbf',
    'iat',
    'jti',
    'azp',
    'nonce',
    'auth_time',
    'at_hash',
    'c_hash',
    'acr',
    'amr',
    'sub_jwk',
    'cnf',
    'sip_from_tag',
    'sip_date',
    'sip_callid',
    'sip_cseq_num',
    'sip_via_branch',
    'orig',
    'dest',
    'mky',
    'events',
    'toe',
    'txn',
    'rph',
    'sid',
    'vot',
    'vtm'
  ];

  const decodeToken = (token) => {
    const parts = token.split('.');
    const [header, payload, signature] = parts;
  
    if (parts.length !== 3 || !header || !payload || !signature) {
      throw new Error('ID token could not be decoded');
    }
    const payloadJSON = JSON.parse(urlDecodeB64(payload));
    const claims = { __raw: token };
    const user = {};
    Object.keys(payloadJSON).forEach(k => {
      claims[k] = payloadJSON[k];
      if (!idTokendecoded.includes(k)) {
        user[k] = payloadJSON[k];
      }
    });
    return {
      encoded: { header, payload, signature },
      header: JSON.parse(urlDecodeB64(header)),
      claims,
      user
    };
  };

  const createCacheKey = (client_id, audience, scope) => {
    return `${CACHE_KEY_PREFIX}::${client_id}::${audience}::${scope}`;
  }

  const createCacheEntry = (idToken, accessToken, expiresIn, audience, scope, clientId, refreshToken) => {
    const decodedToken = decodeToken(idToken);

    const now = Date.now();
    const expiresInTime = Math.floor(now / 1000) + expiresIn;

    const expirySeconds = Math.min(
      expiresInTime,
      decodedToken.claims.exp
    );

    return {
      body: {
        id_token: idToken,
        access_token: accessToken,
        expires_in: expiresIn,
        decodedToken: decodedToken,
        audience: audience,
        scope: scope,
        client_id: clientId,
        refresh_token: refreshToken
      },
      expiresAt: expirySeconds
    }
  }

  useEffect(() => {
    async function loginWithMagicLink(parsedHash) {
      let clientId = 'idM0BINRTdeMuUKsTw00U5vRmojFRGcP';
      //let cacheKey = createCacheKey(clientId, (resJson.audience ? resJson.audience : `https://${resJson.domain}/api/v2/`), resJson.userData.scope);
      //let cacheEntry = createCacheEntry(resJson.userData.id_token, resJson.userData.access_token, resJson.userData.expires_in, (resJson.audience ? resJson.audience : `https://${resJson.domain}/api/v2/`), resJson.userData.scope, clientId);
      //localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      //auth0.7mRIJ6CjBrcuWr9HMsIBIhSiyE3B3liT.is.authenticated
      //Cookies.set(`auth0.${clientId}.is.authenticated`, true);
      document.cookie = `auth0.${clientId}.is.authenticated=true`;
      history.push('/');
    }

    if(hash){
      let parsedHash = new URLSearchParams(hash);
      console.log(parsedHash);
      //loginWithMagicLink();
    }
  }, [hash]);

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
            <option value="email1">Email/Password with Self-registration (U)</option>
            <option value="email22">Email/Password with Self-registration</option>
            <option value="mfa_optional">Email/Password Self-registration - MFA optional</option>
            <option value="mfa_mandatory">Email/Password Self-registration - MFA mandatory</option>
            <option value="sniper_link">Email/Password Self-registration - sniper link verification</option>
            <option value="sms_otp">Mobile number & OTP</option>
            <option value="phone_password">Mobile number & password</option>
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
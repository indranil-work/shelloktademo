import React, { createContext, useContext, useState, useEffect } from 'react';
import { Auth0Provider } from "@auth0/auth0-react";
import history from "../utils/history";
import config from "../auth_config.json";

const UserContext = createContext();

const onRedirectCallback = (appState) => {
  history.push(
    appState && appState.returnTo ? appState.returnTo : window.location.pathname
  );
};

export const UserProvider = ({ children }) => {
  const [selectedLocale, setSelectedLocale] = useState("en-US");
  const [selectedJourney, setSelectedJourney] = useState(() => {
    // Get journey from URL or localStorage
    const params = new URLSearchParams(window.location.search);
    const journeyParam = params.get('journey');
    return journeyParam || localStorage.getItem('selectedJourney') || "email1";
  });
  
  const [currentConfig, setCurrentConfig] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const journeyParam = params.get('journey');
    const journey = journeyParam || localStorage.getItem('selectedJourney') || "email1";
    return config.journeyConfig[journey] || config.journeyConfig['email1'];
  });

  useEffect(() => {
    localStorage.setItem('selectedJourney', selectedJourney);
  }, [selectedJourney]);

  const getClientConfig = () => {
    return config.journeyConfig[selectedJourney] || config.journeyConfig['email1'];
  };

  const updateJourney = (journey) => {
    setSelectedJourney(journey);
    setCurrentConfig(config.journeyConfig[journey] || config.journeyConfig['email1']);
    localStorage.setItem('selectedJourney', journey);
  };

  const getAuthParams = () => {
    const baseParams = {
      redirect_uri: window.location.origin,
    };

    if (selectedJourney === 'mfa_mandatory') {
      return {
        ...baseParams,
        acr_values: 'urn:okta:loa:2fa:any',
        prompt: 'login'
      };
    }

    return baseParams;
  };

  // Force remount of Auth0Provider when journey changes
  const providerKey = `${selectedJourney}-${currentConfig.clientId}`;

  return (
    <UserContext.Provider value={{
      selectedLocale,
      setSelectedLocale,
      selectedJourney,
      setSelectedJourney: updateJourney,
      getClientConfig
    }}>
      <Auth0Provider
        key={providerKey}
        domain={currentConfig.domain}
        clientId={currentConfig.clientId}
        onRedirectCallback={onRedirectCallback}
        authorizationParams={getAuthParams()}
        useRefreshTokens={true}
        cacheLocation="localstorage"
        issuer={config.auth0.issuerBaseURL}
      >
        {children}
      </Auth0Provider>
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext); 
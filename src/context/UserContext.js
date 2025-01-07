import React, { createContext, useContext, useState } from 'react';
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
  const [selectedJourney, setSelectedJourney] = useState("email1");
  const [currentConfig, setCurrentConfig] = useState(config.journeyConfig['email1']);

  const getClientConfig = () => {
    return config.journeyConfig[selectedJourney] || config.journeyConfig['email1'];
  };

  const updateJourney = (journey) => {
    setSelectedJourney(journey);
    setCurrentConfig(config.journeyConfig[journey] || config.journeyConfig['email1']);
  };

  return (
    <UserContext.Provider value={{
      selectedLocale,
      setSelectedLocale,
      selectedJourney,
      setSelectedJourney: updateJourney,
      getClientConfig
    }}>
      <Auth0Provider
        key={currentConfig.clientId}
        domain={currentConfig.domain}
        clientId={currentConfig.clientId}
        onRedirectCallback={onRedirectCallback}
        authorizationParams={{
          redirect_uri: window.location.origin,
        }}
      >
        {children}
      </Auth0Provider>
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext); 
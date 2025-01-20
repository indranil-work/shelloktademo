import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from '../context/UserContext';

const Login = () => {
  const { selectedJourney, setSelectedJourney, selectedLocale } = useUser();
  const { loginWithRedirect } = useAuth0();
  const { search } = useLocation()
  const parsedSearch = new URLSearchParams(search);

  setSelectedJourney(parsedSearch.get('journey'));

  if (!selectedJourney) {
    return("Please select a journey first");
  }

  const url = window.location.href;
  const inviteMatches = url.match(/invitation=([^&]+)/);
  const orgMatches = url.match(/organization=([^&]+)/);
  if (inviteMatches && orgMatches) {
    loginWithRedirect({
      authorizationParams: {
        organization: orgMatches[1],
        invitation: inviteMatches[1],
      }
    });
  }else{
    loginWithRedirect({
      authorizationParams: {
        ui_locales: selectedLocale
      }
    });
  }

  return('Redirecting...');
  
};

export default Login; 
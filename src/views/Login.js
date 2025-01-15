import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from '../context/UserContext';

const Login = () => {
  const { selectedJourney, setSelectedJourney, selectedLocale } = useUser();
  const { loginWithRedirect } = useAuth0();
  const { search } = useLocation()
  const parsedSearch = URLSearchParams(search);

  setSelectedJourney(parsedSearch.get('journey'));

  if (!selectedJourney) {
    return("Please select a journey first");
  }
  
  loginWithRedirect({
    authorizationParams: {
      ui_locales: selectedLocale
    }
  });

  return('Redirecting...');
  
};

export default Login; 
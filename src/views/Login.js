import React from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from '../context/UserContext';

const Login = () => {
  const { selectedJourney, setSelectedJourney, selectedLocale } = useUser();
  const { loginWithRedirect } = useAuth0();
  const [searchParams, setSearchParams] = useSearchParams();

  setSelectedJourney(searchParams.get('journey'));

  if (!selectedJourney) {
    return("Please select a journey first");
  }
  
  loginWithRedirect({
    authorizationParams: {
      ui_locales: selectedLocale
    }
  });
  
};

export default Login; 
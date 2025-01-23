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
        ui_locales: selectedLocale
      }
    });
  }else if(parsedSearch.get('journey') === 'sms_invite'){
    loginWithRedirect({
      authorizationParams: {
        'ui_locales': selectedLocale,
        'login_hint': parsedSearch.get('login_hint'),
        'ext-code': parsedSearch.get('code'),
        'authenticator': true,
        'invite_journey': true,
        'passwordless': parsedSearch.has('passwordless')
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
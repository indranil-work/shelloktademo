import React from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from '../context/UserContext';

const Login = () => {
  const { selectedJourney, setSelectedJourney, selectedLocale } = useUser();
  const { loginWithRedirect } = useAuth0();
  const { search } = useLocation()
  const parsedSearch = new URLSearchParams(search);
  const history = useHistory();

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
    /*loginWithRedirect({
      authorizationParams: {
        'ui_locales': selectedLocale,
        'login_hint': parsedSearch.get('login_hint').replace('+44', ''),
        'ext-code': parsedSearch.get('code'),
        'authenticator': true,
        'invite_journey': true,
        'passwordless': parsedSearch.has('passwordless'),
        'connection': 'sms'
      }
    });*/
    let redirectUrl = `https://shelldemo.oktademo.cloud/passwordless/verify_redirect?scope=openid profile email&response_type=token&redirect_uri=https://storytime.oktademo.app/callback&invite_journey=true&audience=https://demo.okta.com&authenticator=true&verification_code=${parsedSearch.get('code')}&connection=sms&client_id=KhAe6PSW1OePD5mnXyljFDDuuofi8Sxf&phone_number=${parsedSearch.get('login_hint')}`
    history.push(redirectUrl);
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
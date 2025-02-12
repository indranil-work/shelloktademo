import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";

import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./views/Home";
import Profile from "./views/Profile";
import Login from "./views/Login";
import ExternalApi from "./views/ExternalApi";
import LogoutSuccess from './views/LogoutSuccess';
import { useAuth0 } from "@auth0/auth0-react";
import history from "./utils/history";
import { UserProvider } from './context/UserContext';

// styles
import "./App.css";

// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
initFontAwesome();

const App = () => {
  const { isLoading, error } = useAuth0();

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <UserProvider>
      <Router history={history}>
        <div id="app" className="d-flex flex-column h-100">
          <NavBar />
          <Container className="flex-grow-1 mt-5">
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/profile" component={Profile} />
            <Route path="/external-api" component={ExternalApi} />
            <Route path="/login" component={Login} />
            <Route exact path="/logout-success" component={LogoutSuccess} />
          </Switch>
        </Container>
          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;

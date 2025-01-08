import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const PersonalDetails = ({ user }) => (
  <>
    <h1>
      <span className="icon">👤</span>
      Personal details
    </h1>

    <form className="profile-form">
      <div className="form-row">
        <div className="form-group">
          <label>First name *</label>
          <input type="text" value={user?.given_name || ''} readOnly />
        </div>
        <div className="form-group">
          <label>Last name *</label>
          <input type="text" value={user?.family_name || ''} readOnly />
        </div>
      </div>

      <div className="form-group full-width">
        <label>Email address *</label>
        <input type="email" value={user?.email || ''} readOnly />
        <a href="#" className="change-email-link">Change email</a>
      </div>

      <div className="form-group full-width">
        <label>Mobile phone</label>
        <div className="phone-input">
          <select className="country-code">
            <option value="US">🇺🇸 +1</option>
          </select>
          <input type="tel" placeholder="Mobile phone" />
        </div>
      </div>

      <button type="submit" className="save-btn">Save changes</button>
    </form>
  </>
);

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  return (
    <>
      <h1>
        <span className="icon">🔑</span>
        Change password
      </h1>

      <form className="password-form">
        <div className="form-group">
          <label>Current password *</label>
          <div className="password-input-wrapper">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              👁️
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>New password *</label>
          <div className="password-input-wrapper">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              👁️
            </button>
          </div>
          <div className="password-requirements">
            Your password must be at least:
            <ul>
              <li>8 characters</li>
              <li>1 uppercase</li>
              <li>1 number</li>
            </ul>
          </div>
        </div>

        <div className="password-strength">
          <label>Password Strength</label>
          <div className="strength-meter">
            <div className="strength-bar"></div>
          </div>
        </div>

        <button type="submit" className="save-btn">Save</button>
      </form>
    </>
  );
};

const Communications = () => {
  const [preferences, setPreferences] = useState({
    shellNews: false,
    engineersClub: false
  });

  const handleCheckboxChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <>
      <h1>
        <span className="icon">💬</span>
        Communications
      </h1>

      <div className="communications-form">
        <p className="communications-disclaimer">
          By checking a communication preference you agree to accept marketing communication from Shell
        </p>

        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={preferences.shellNews}
              onChange={() => handleCheckboxChange('shellNews')}
            />
            <span className="checkbox-text">Shell News</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={preferences.engineersClub}
              onChange={() => handleCheckboxChange('engineersClub')}
            />
            <span className="checkbox-text">Shell Engineers Club</span>
          </label>
        </div>

        <button type="submit" className="save-btn">Save</button>
      </div>
    </>
  );
};

const RevokeAccess = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { logout } = useAuth0();

  const handleRevoke = () => {
    // Here you would typically call your API to revoke access
    // For now, we'll just log out the user
    logout({ returnTo: window.location.origin });
  };

  return (
    <>
      <h1>
        <span className="icon">🚫</span>
        Revoke Access
      </h1>

      <div className="revoke-access-form">
        <p className="revoke-description">
          Remove access and delete your account for this application.
        </p>

        <div className="button-group">
          <button 
            className="cancel-btn"
            onClick={() => setShowConfirmation(false)}
          >
            Cancel
          </button>
          <button 
            className="revoke-btn"
            onClick={handleRevoke}
          >
            Revoke access
          </button>
        </div>
      </div>
    </>
  );
};

const Profile = () => {
  const { user, logout } = useAuth0();
  const [activeView, setActiveView] = useState('personal');

  const handleSignOut = () => {
    logout({ returnTo: window.location.origin });
  };

  const renderContent = () => {
    switch (activeView) {
      case 'password':
        return <ChangePassword />;
      case 'communications':
        return <Communications />;
      case 'revoke':
        return <RevokeAccess />;
      case 'personal':
      default:
        return <PersonalDetails user={user} />;
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="sidebar">
          <h2>My account</h2>
          <nav>
            <ul>
              <li 
                className={activeView === 'personal' ? 'active' : ''}
                onClick={() => setActiveView('personal')}
              >
                <span className="icon">👤</span>
                Personal details
              </li>
              <li 
                className={activeView === 'password' ? 'active' : ''}
                onClick={() => setActiveView('password')}
              >
                <span className="icon">🔑</span>
                Change password
              </li>
              <li>
                <span className="icon">📱</span>
                2-step verification
              </li>
              <li>
                <span className="icon">✉️</span>
                Change email
              </li>
              <li>
                <span className="icon">🔐</span>
                Passwordless authentication
              </li>
              <li
                className={activeView === 'revoke' ? 'active' : ''}
                onClick={() => setActiveView('revoke')}
              >
                <span className="icon">🚫</span>
                Revoke access
              </li>
              <li 
                className={activeView === 'communications' ? 'active' : ''}
                onClick={() => setActiveView('communications')}
              >
                <span className="icon">💬</span>
                Communications
              </li>
              <li onClick={handleSignOut}>
                <span className="icon">↪️</span>
                Sign out
              </li>
              <li onClick={handleSignOut}>
                <span className="icon">📱</span>
                Sign out of all devices
              </li>
            </ul>
          </nav>
        </div>

        <div className="profile-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import config from "../auth_config.json";

const PersonalDetails = ({ user }) => {
  const [formData, setFormData] = useState({
    given_name: user?.given_name || '',
    family_name: user?.family_name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [initialFormData, setInitialFormData] = useState({
    given_name: user?.given_name || '',
    family_name: user?.family_name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any previous status messages
    setStatus({ type: '', message: '' });
  };

  // Check if any changes were made
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    
    try {
      const userId = user["https://auth0.com/user_id"];
      const response = await fetch(`${config.apiUrl}/users/${userId}/personal-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.given_name,
          lastName: formData.family_name,
          email: formData.email,
          phoneNumber: formData.phoneNumber
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update personal details');
      }

      const result = await response.json();
      console.log('Personal details updated successfully', result);
      setStatus({
        type: 'success',
        message: 'Personal details updated successfully'
      });
      setInitialFormData(formData); // Update initial state to match current
      
    } catch (error) {
      console.error('Error updating personal details:', error);
      setStatus({
        type: 'error',
        message: 'Failed to update personal details. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>
        <span className="icon">👤</span>
        Personal details
      </h1>

      <form className="profile-form" onSubmit={handleSubmit}>
        {status.message && (
          <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
            {status.message}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>First name *</label>
            <input 
              type="text" 
              name="given_name"
              value={formData.given_name}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Last name *</label>
            <input 
              type="text" 
              name="family_name"
              value={formData.family_name}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Email address *</label>
          <input 
            type="email" 
            value={user?.email || ''} 
            readOnly 
          />
          <a href="#" className="change-email-link">Change email</a>
        </div>

        <div className="form-group full-width">
          <label>Mobile phone</label>
          <div className="phone-input">
            <select className="country-code" disabled={loading}>
              <option value="US">🇺🇸 +1</option>
            </select>
            <input 
              type="tel"
              name="phoneNumber"
              placeholder="Mobile phone"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="save-btn"
          disabled={loading || !hasChanges()}
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </>
  );
};

const PasswordRequirement = ({ isValid, children }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [isValid]);

  return (
    <li className={`${isValid ? 'valid' : ''} ${isAnimating ? 'checking' : ''}`}>
      {children}
    </li>
  );
};

const ChangePassword = ({ user }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [passwordPolicy, setPasswordPolicy] = useState(null);

  // Fetch password policy when component mounts
  useEffect(() => {
    const fetchPasswordPolicy = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/password-policy`);
        if (!response.ok) throw new Error('Failed to fetch password policy');
        const data = await response.json();
        setPasswordPolicy(data.policy);
      } catch (error) {
        console.error('Error fetching password policy:', error);
      }
    };

    fetchPasswordPolicy();
  }, []);

  // Password validation based on policy
  const validatePassword = (password) => {
    if (!passwordPolicy) return false;
    
    const hasMinLength = password.length >= passwordPolicy.min_length;
    const hasUpperCase = !passwordPolicy.requires_uppercase || /[A-Z]/.test(password);
    const hasLowerCase = !passwordPolicy.requires_lowercase || /[a-z]/.test(password);
    const hasNumbers = !passwordPolicy.requires_numbers || /\d/.test(password);
    const hasSymbols = !passwordPolicy.requires_symbols || /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasMinLength && hasUpperCase && hasLowerCase && hasNumbers && hasSymbols;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const userId = user["https://auth0.com/user_id"];
      const response = await fetch(`${config.apiUrl}/users/${userId}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      setStatus({
        type: 'success',
        message: 'Password changed successfully'
      });
      setFormData({ currentPassword: "", newPassword: "" }); // Clear form
      
    } catch (error) {
      console.error('Error changing password:', error);
      setStatus({
        type: 'error',
        message: error.message || 'Failed to change password. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>
        <span className="icon">🔑</span>
        Change password
      </h1>

      <form className="password-form" onSubmit={handleSubmit}>
        {status.message && (
          <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
            {status.message}
          </div>
        )}

        <div className="form-group">
          <label>Current password *</label>
          <div className="password-input-wrapper">
            <input
              type={showCurrentPassword ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  currentPassword: e.target.value
                }));
                setStatus({ type: '', message: '' });
              }}
              placeholder="Current password"
              disabled={loading}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              disabled={loading}
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
              name="newPassword"
              value={formData.newPassword}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }));
                setStatus({ type: '', message: '' });
              }}
              placeholder="New password"
              disabled={loading}
              required
              minLength={8}
              pattern="(?=.*\d)(?=.*[A-Z]).{8,}"
              title="Must contain at least 8 characters, one number and one uppercase letter"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowNewPassword(!showNewPassword)}
              disabled={loading}
            >
              👁️
            </button>
          </div>
          <div className="password-requirements">
            Your password must have:
            <ul>
              {passwordPolicy && (
                <>
                  <PasswordRequirement 
                    isValid={formData.newPassword.length >= passwordPolicy.min_length}
                  >
                    At least {passwordPolicy.min_length} characters
                  </PasswordRequirement>

                  {passwordPolicy.requires_uppercase && (
                    <PasswordRequirement 
                      isValid={/[A-Z]/.test(formData.newPassword)}
                    >
                      At least 1 uppercase letter
                    </PasswordRequirement>
                  )}

                  {passwordPolicy.requires_lowercase && (
                    <PasswordRequirement 
                      isValid={/[a-z]/.test(formData.newPassword)}
                    >
                      At least 1 lowercase letter
                    </PasswordRequirement>
                  )}

                  {passwordPolicy.requires_numbers && (
                    <PasswordRequirement 
                      isValid={/\d/.test(formData.newPassword)}
                    >
                      At least 1 number
                    </PasswordRequirement>
                  )}

                  {passwordPolicy.requires_symbols && (
                    <PasswordRequirement 
                      isValid={/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)}
                    >
                      At least 1 special character
                    </PasswordRequirement>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>

        <button 
          type="submit" 
          className="save-btn"
          disabled={loading || !formData.currentPassword || !validatePassword(formData.newPassword)}
        >
          {loading ? 'Changing password...' : 'Change password'}
        </button>
      </form>
    </>
  );
};

const Communications = ({ user }) => {

  const [preferences, setPreferences] = useState({
    shellNews: false,
    engineersClub: false
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [initialPreferences, setInitialPreferences] = useState({
    shellNews: false,
    engineersClub: false
  });

  // Initialize preferences from user token
  useEffect(() => {
    
    if (user?.communications_preference) {
      const userPrefs = {
        shellNews: user.communications_preference.includes('shellNews'),
        engineersClub: user.communications_preference.includes('engineersClub')
      };
      console.log('Setting preferences to:', userPrefs);
      setPreferences(userPrefs);
      setInitialPreferences(userPrefs);
    }
  }, [user]);

  const handleCheckboxChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    // Clear any previous status messages
    setStatus({ type: '', message: '' });
  };

  // Check if any changes were made
  const hasChanges = () => {
    return JSON.stringify(preferences) !== JSON.stringify(initialPreferences);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    
    try {
      const userId = user["https://auth0.com/user_id"];
      const selectedPreferences = Object.entries(preferences)
        .filter(([_, isSelected]) => isSelected)
        .map(([key, _]) => key);

      const response = await fetch(`${config.apiUrl}/users/${userId}/communications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: selectedPreferences
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update communications preferences');
      }

      const result = await response.json();
      console.log('Communications preferences updated successfully', result);
      setStatus({
        type: 'success',
        message: 'Communications preferences updated successfully'
      });
      setInitialPreferences(preferences); // Update initial state to match current
      
    } catch (error) {
      console.error('Error updating communications preferences:', error);
      setStatus({
        type: 'error',
        message: 'Failed to update communications preferences. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>
        <span className="icon">💬</span>
        Communications
      </h1>

      <form className="communications-form" onSubmit={handleSubmit}>
        {status.message && (
          <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
            {status.message}
          </div>
        )}

        <p className="communications-disclaimer">
          By checking a communication preference you agree to accept marketing communication from Shell
        </p>

        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={preferences.shellNews}
              onChange={() => handleCheckboxChange('shellNews')}
              disabled={loading}
            />
            <span className="checkbox-text">Shell News</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={preferences.engineersClub}
              onChange={() => handleCheckboxChange('engineersClub')}
              disabled={loading}
            />
            <span className="checkbox-text">Shell Engineers Club</span>
          </label>
        </div>

        <button 
          type="submit" 
          className="save-btn"
          disabled={loading || !hasChanges()}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
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

  console.log('Profile Component - User:', user);

  const handleSignOut = () => {
    logout({ returnTo: window.location.origin });
  };

  const renderContent = () => {
    switch (activeView) {
      case 'password':
        return <ChangePassword user={user} />;
      case 'communications':
        return <Communications user={user} />;
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

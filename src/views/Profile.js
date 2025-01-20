import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import config from "../auth_config.json";

const PersonalDetails = ({ user, setActiveView }) => {
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
          <a 
            href="#" 
            className="change-email-link"
            onClick={(e) => {
              e.preventDefault();
              setActiveView('email');
            }}
          >
            Change email
          </a>
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

const RevokeAccess = ({ user }) => {
  const { logout } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleRevokeAccess = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/auth0/revoke-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user['https://auth0.com/user_id'],
          client_id: user['https://shell.com/appid']
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to revoke access');

      // Use Auth0's logout
      logout({ 
        logoutParams: {
          returnTo: window.location.origin 
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="revoke-access">
      <h3>🔒 Revoke Access</h3>
      <p className="description">
        If a user is active in multiple applications their account is not completely deleted from the CIPM database. 
        Instead, it is revoked from only the requested application and the user can continue to use other applications.
      </p>

      {!showConfirmation ? (
        <button 
          onClick={() => setShowConfirmation(true)} 
          className="auth-button danger"
          disabled={loading}
        >
          Revoke access
        </button>
      ) : (
        <div className="confirmation-dialog">
          <div className="dialog-content">
            <h4>Are you sure?</h4>
            <p>This service will be removed, and all related information will be deleted permanently and cannot be undone.</p>
            <div className="dialog-buttons">
              <button 
                onClick={() => setShowConfirmation(false)} 
                className="auth-button secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleRevokeAccess} 
                className="auth-button danger"
                disabled={loading}
              >
                {loading ? 'Revoking...' : 'Yes, revoke'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
};

const ChangeEmail = ({ user }) => {
  const [step, setStep] = useState('password'); // steps: password, email, success
  const [formData, setFormData] = useState({
    password: '',
    newEmail: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = async () => {
    try {
      setLoading(true);
      const userId = user["https://auth0.com/user_id"];
      
      const response = await fetch(`${config.apiUrl}/users/${userId}/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid password. Please try again.');
        }
        throw new Error(data.error || 'Failed to verify password');
      }

      // Password verified successfully, move to next step
      setStep('email');
      setStatus({ type: '', message: '' });
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const requestEmailChange = async () => {
    try {
      setLoading(true);
      const userId = user["https://auth0.com/user_id"];
      const response = await fetch(`${config.apiUrl}/users/${userId}/change-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newEmail: formData.newEmail,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change email');
      }

      setStep('success');
      setStatus({ 
        type: 'success', 
        message: 'Please check your email to complete the change.' 
      });
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const resendEmailLink = async () => {
    try {
      setLoading(true);
      const userId = user["https://auth0.com/user_id"];
      const response = await fetch(`${config.apiUrl}/users/${userId}/resend-email-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.newEmail
        })
      });

      if (!response.ok) {
        throw new Error('Failed to resend verification email');
      }

      setStatus({ 
        type: 'success', 
        message: 'New verification email sent! Please check your inbox.' 
      });
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: 'Failed to resend verification email. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="email-form" onSubmit={(e) => e.preventDefault()}>
      {step === 'password' && (
        <div className="form-group">
          <h1>
            <span className="icon">✓</span>
            Password validation
          </h1>
          <p>Before proceeding, please enter your current password</p>
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <button 
            className="continue-btn"
            onClick={validatePassword}
            disabled={loading || !formData.password}
          >
            {loading ? 'Validating...' : 'Continue'}
          </button>
        </div>
      )}

      {step === 'email' && (
        <div className="form-group">
          <h1>
            <span className="icon">✉️</span>
            Change email
          </h1>
          <p>When you change your email address please check your email for a message with a verification link to confirm the change.</p>
          <input
            type="email"
            name="newEmail"
            value={formData.newEmail}
            onChange={handleInputChange}
            placeholder="Enter your new email address"
            required
          />
          <button 
            className="continue-btn"
            onClick={requestEmailChange}
            disabled={loading || !formData.newEmail}
          >
            {loading ? 'Sending...' : 'Next'}
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="form-group">
          <h1>
            <span className="icon">✉️</span>
            Verify your email
          </h1>
          <div className="alert alert-success">
            <p>Please check your email to complete the change.</p>
            <button 
              type="button"
              className="resend-btn"
              onClick={resendEmailLink}
              disabled={loading}
            >
              Resend verification email
            </button>
          </div>
        </div>
      )}

      {status.type === 'error' && (
        <div className="alert alert-danger">
          {status.message}
        </div>
      )}
    </form>
  );
};

const SetupAuthenticator = ({ user }) => {
  const { logout } = useAuth0();
  const [step, setStep] = useState('password');
  const [formData, setFormData] = useState({
    password: '',
    verificationCode: ''
  });
  const [mfaData, setMfaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mfaToken, setMfaToken] = useState(null);
  const [hasAuthenticator, setHasAuthenticator] = useState(false);

  // Update function name and endpoint
  const getMfaEnrollmentData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/users/${user["https://auth0.com/user_id"]}/start-mfa-enrollment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mfaToken}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get MFA enrollment data');

      setMfaData(data);
      setStep('qr-code');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAuthenticatorStatus = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/users/${user["https://auth0.com/user_id"]}/authenticator-status`);
      const data = await response.json();
      setHasAuthenticator(data.hasAuthenticator);
    } catch (err) {
      console.error('Error checking authenticator status:', err);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/users/${user["https://auth0.com/user_id"]}/verify-mfa-enrollment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mfaToken}`
        },
        body: JSON.stringify({
          verificationCode: formData.verificationCode,
          client_id: user['https://shell.com/appid']
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to verify code');

      setStep('setup-complete');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthenticatorStatus();
  }, []);

  const renderContent = () => {
    switch (step) {
      case 'password':
        return (
          <div className="authenticator-step">
            <h3>✓ Password validation</h3>
            <p className="step-description">Before proceeding, please enter your current password:</p>
            <div className="password-input-wrapper">
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                className="auth-input"
              />
            </div>
            <button 
              onClick={handlePasswordValidation}
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Validating...' : 'Continue'}
            </button>
          </div>
        );

      case 'setup-button':
        return (
          <div className="authenticator-step">
            <h3>⚙️ Authenticator app setup</h3>
            <button 
              onClick={getMfaEnrollmentData}
              className="setup-auth-button"
            >
              Setup an Authenticator App
            </button>
          </div>
        );

      case 'qr-code':
        return (
          <div className="authenticator-step">
            <h3>⚙️ Authenticator app setup</h3>
            <div className="qr-section">
              {mfaData && (
                <>
                  <img src={mfaData.barcode_uri} alt="QR Code" className="qr-code" />
                  <div className="secret-key">
                    <p>Secret Key: <span>{mfaData.secret}</span></p>
                  </div>
                </>
              )}
              <p className="setup-instructions">
                Scan the QR code or enter the Secret Key. Once the account is created, enter the PIN code generated in the Authenticator App and click on "Finish setup".
              </p>
              <div className="verification-input">
                <input
                  type="text"
                  value={formData.verificationCode}
                  onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                  placeholder="Enter verification code"
                  className="auth-input"
                />
                <button 
                  onClick={handleVerifyCode}
                  disabled={loading}
                  className="auth-button"
                >
                  Finish setup
                </button>
              </div>
            </div>
          </div>
        );

      case 'setup-complete':
        return (
          <div className="authenticator-step">
            <h3>⚙️ Authenticator app setup completed</h3>
            <div className="completion-message">
              <p>Congratulations! You have completed your Authenticator app setup.</p>
              <p className="note">Note: For subsequent logins, user will need to enter the OTP generated in the Authenticator App.</p>
            </div>
          </div>
        );

      case 'confirm-deactivate':
        return (
          <div className="authenticator-step">
            <h3>🚫 Remove Authenticator App Integration</h3>
            <p className="confirmation-message">Are you sure you want to remove the Authenticator app integration?</p>
            <div className="button-group">
              <button 
                onClick={handleDeactivateConfirm}
                disabled={loading}
                className="confirm-btn"
              >
                Yes
              </button>
              <button 
                onClick={() => setStep('password')}
                disabled={loading}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handlePasswordValidation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/users/${user["https://auth0.com/user_id"]}/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: formData.password
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Password validation failed');

      setMfaToken(data.mfa_token);
      // After password validation, go to appropriate next step
      if (hasAuthenticator) {
        setStep('confirm-deactivate');
      } else {
        setStep('setup-button');
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateConfirm = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/users/${user["https://auth0.com/user_id"]}/deactivate-mfa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: user['https://shell.com/appid']
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to deactivate authenticator');

      // Use Auth0's logout function instead of redirecting to /logout
      logout({ returnTo: window.location.origin });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-authenticator">
      {renderContent()}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

const TwoStepVerification = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('initial');
  const [isEnabled, setIsEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Check if two-step verification is enabled from user claim
  useEffect(() => {
    const twoStepEnabled = user?.['https://shell.com/two-step-enabled'] === true;
    setIsEnabled(twoStepEnabled);
  }, [user]);

  const handleToggle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/auth0/passwordless/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          send: 'code',
          client_id: user['https://shell.com/appid'],
          user_id: user['https://auth0.com/user_id']
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to start verification');

      setStep('verify');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/auth0/passwordless/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          code: verificationCode,
          client_id: user['https://shell.com/appid'],
          user_id: user['https://auth0.com/user_id']
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to verify code');

      setIsEnabled(true);
      setStep('success');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'initial':
        return (
          <div className="authenticator-step">
            <h3>🔐 2-step verification</h3>
            <p className="step-description">
              This workflow is linked to the primary method of authentication. For example, if mobile number is used as 
              the authentication method, then verification code will be sent to the mobile device; if email address is 
              used as the authentication method, then verification code will be sent to the email address.
            </p>
            <div className="toggle-section">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={handleToggle}
                  disabled={loading}
                />
                <span className="slider round"></span>
              </label>
              <span className="toggle-label">
                {isEnabled ? 'Disable' : 'Enable'} 2-step verification
              </span>
            </div>
          </div>
        );

      case 'verify':
        return (
          <div className="authenticator-step">
            <h3>🔐 2-step verification</h3>
            <div className="verification-input">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter the verification code"
                className="auth-input"
              />
              <button 
                onClick={handleVerifyCode}
                disabled={loading}
                className="auth-button"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="authenticator-step">
            <h3>🔐 2-step verification updated</h3>
            <p className="success-message">
              2-step verification has been {isEnabled ? 'enabled' : 'disabled'} successfully.
            </p>
            <button 
              onClick={() => setStep('initial')}
              className="auth-button"
            >
              Back to settings
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="two-step-verification">
      {renderContent()}
      {error && <div className="error">{error}</div>}
    </div>
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
      case 'email':
        return <ChangeEmail user={user} />;
      case 'authenticator':
        return <SetupAuthenticator user={user} />;
      case 'revoke':
        return <RevokeAccess user={user} />;
      case '2step':
        return <TwoStepVerification user={user} />;
      case 'personal':
      default:
        return <PersonalDetails user={user} setActiveView={setActiveView} />;
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
              <li 
                onClick={() => user?.['https://shell.com/app_metadata/two-step-mfa'] === 'optional' ? setActiveView('2step') : null}
                className={`${activeView === '2step' ? 'active' : ''} ${user?.['https://shell.com/app_metadata/two-step-mfa'] !== 'optional' ? 'disabled' : ''}`}
              >
                <span className="icon">📱</span>
                2-step verification
              </li>
              <li
                className={activeView === 'authenticator' ? 'active' : ''}
                onClick={() => setActiveView('authenticator')}
              >
                <span className="icon">🔐</span>
                Setup Authenticator App
              </li>
              <li
                className={activeView === 'email' ? 'active' : ''}
                onClick={() => setActiveView('email')}
              >
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

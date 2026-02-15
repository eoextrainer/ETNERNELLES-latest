import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LoginPage.css';
import { getApiBaseCandidates, isApiBaseLocked } from '../config/api';

export default function LoginPage({ onLogin }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const safeParseJson = async (response) => {
    const text = await response.text();
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch (parseError) {
      return null;
    }
  };

  const credentials = [
    { label: 'Sys Admin', email: 'admin@eternelles-agency.com', password: 'admin123' },
    { label: 'Platform Admin', email: 'manager@eternelles-agency.com', password: 'manager123' },
    { label: 'Moderator', email: 'moderator@eternelles-agency.com', password: 'moderator123' },
    { label: 'Premium User', email: 'user1@eternelles-agency.com', password: 'user1premium' },
    { label: 'Normal User', email: 'user2@eternelles-agency.com', password: 'user2normal' },
    { label: 'Demo User', email: 'demo@eternelles-agency.com', password: 'demo123' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const candidates = getApiBaseCandidates();
      let response;
      let data;
      let lastError;
        let selectedBase;

      for (const base of candidates) {
        try {
          response = await fetch(`${base}/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
            }),
          });

          data = await safeParseJson(response);

          if (response.ok && data) {
            lastError = null;
            selectedBase = base;
            break;
          }

          lastError = new Error(data?.detail || t('errors.invalidCredentials'));
        } catch (fetchError) {
          lastError = fetchError;
        }
      }

      if (lastError) {
        throw lastError;
      }
      if (selectedBase && !isApiBaseLocked()) {
        localStorage.setItem('api_base', selectedBase);
      }
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      onLogin({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name,
        role: data.user.role,
        subscription_tier: data.user.subscription_tier,
      });
    } catch (err) {
      const messageText = err?.message || '';
      const isNetworkError = messageText.toLowerCase().includes('failed to fetch')
        || messageText.toLowerCase().includes('networkerror');
      const message = isNetworkError
        ? t('errors.networkError')
        : messageText || t('errors.loginFailed');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const candidates = getApiBaseCandidates();
      let response;
      let data;
      let lastError;
        let selectedBase;

      for (const base of candidates) {
        try {
          response = await fetch(`${base}/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: 'demo@eternelles-agency.com',
              password: 'demo123',
            }),
          });

          data = await safeParseJson(response);

          if (response.ok && data) {
            lastError = null;
            selectedBase = base;
            break;
          }

          lastError = new Error(data?.detail || t('errors.invalidCredentials'));
        } catch (fetchError) {
          lastError = fetchError;
        }
      }

      if (lastError) {
        throw lastError;
      }
      if (selectedBase && !isApiBaseLocked()) {
        localStorage.setItem('api_base', selectedBase);
      }
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      onLogin({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name,
        role: data.user.role,
        subscription_tier: data.user.subscription_tier,
      });
    } catch (err) {
      const messageText = err?.message || '';
      const message = messageText || t('errors.loginFailed');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-bg-login"></div>
        <div className="animated-bg-login"></div>
      </div>

      <div className="login-content">
        <div className="login-box">
          <div className="login-header">
            <h1 className="login-logo">ETERNELLES</h1>
            <p className="login-tagline">{t('login.tagline')}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">{t('login.email')}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('login.password')}</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.password')}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading || !email || !password}
            >
              {loading ? t('login.signin_loading') : t('login.signin')}
            </button>
          </form>

          <div className="login-divider">
            <span>{t('login.or')}</span>
          </div>

          <button
            type="button"
            className="demo-button"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            {t('login.demo')}
          </button>

          <div className="credentials-panel">
            <h4>Identifiants</h4>
            <p>Utilisez ces comptes pour vous connecter.</p>
            <ul>
              {credentials.map((item) => (
                <li key={item.email}>
                  <strong>{item.label}</strong>
                  <span>{item.email}</span>
                  <span>{item.password}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="login-footer">
            <p>{t('login.footer')} <span className="signup-link">{t('login.signup')}</span></p>
          </div>
        </div>

        <div className="login-side-text">
          <h2>{t('login.welcome')}</h2>
          <p>{t('login.welcome_subtitle')}</p>
          <ul className="features-list">
            <li>✨ {t('login.features.analytics')}</li>
            <li>🎯 {t('login.features.insights')}</li>
            <li>🔐 {t('login.features.security')}</li>
            <li>📱 {t('login.features.access')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

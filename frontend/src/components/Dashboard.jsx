import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';
import { getApiBaseUrl } from '../config/api';
import PremiumWorkspaceTab from './PremiumWorkspaceTab';

export default function Dashboard({ user, onLogout }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('workspaces');
  const [userData, setUserData] = useState(user);
  const [workspace, setWorkspace] = useState(null);
  const [theme, setTheme] = useState('aura');
  const [chatTarget, setChatTarget] = useState('community');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatOpen, setChatOpen] = useState(true);
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const apiBaseUrl = getApiBaseUrl();
  const chatEndRef = useRef(null);

  const roleThemeMap = useMemo(() => ({
    admin: 'aura',
    manager: 'aura',
    moderator: 'aura',
    premium: 'aura',
    free: 'aura',
    demo: 'aura',
  }), []);

  const normalizeTheme = (value) => {
    const mapping = {
      netflix: 'aura',
      'google-play': 'aura',
      salesforce: 'aura',
      disney: 'aura',
      dark: 'aura',
    };
    return mapping[value] || value;
  };
  const effectiveRole = userData?.role === 'user'
    ? (userData?.subscription_tier || 'free')
    : (userData?.role || 'free');

  const isUserTier = ['premium', 'free', 'demo'].includes(effectiveRole);

  const resolvedAssets = useMemo(() => assets.map((asset) => ({
    ...asset,
    resolvedUrl: asset.file_url?.startsWith('http')
      ? asset.file_url
      : `${apiBaseUrl.replace('/api', '')}${asset.file_url}`,
  })), [assets, apiBaseUrl]);

  const channelMessages = useMemo(() => (
    messages
      .filter((message) => !message.channel || message.channel === chatTarget)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  ), [messages, chatTarget]);

  const lastMessagePreview = useMemo(() => {
    if (!channelMessages.length) return 'Aucun message.';
    const last = channelMessages[channelMessages.length - 1];
    return `${last.user_name || last.from || 'Anonyme'}: ${last.content}`;
  }, [channelMessages]);

  const formatChatTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const gamification = useMemo(() => {
    const base = effectiveRole === 'premium' ? 78 : effectiveRole === 'free' ? 42 : 24;
    const engagement = base + 6;
    const community = base - 4;
    const ratings = base + 8;
    const score = Math.round((engagement + community + ratings) / 3);
    const level = Math.min(10, Math.max(1, Math.ceil(score / 10)));
    const warning = score < 35
      ? 'Faible engagement. Réactivez votre présence pour conserver vos accès.'
      : null;
    return { engagement, community, ratings, score, level, warning };
  }, [effectiveRole]);

  const featureMap = useMemo(() => ({
    admin: [
      { titleKey: 'admin.features.governance', descKey: 'admin.features.governance_desc' },
      { titleKey: 'admin.features.ecosystem', descKey: 'admin.features.ecosystem_desc' },
      { titleKey: 'admin.features.quality', descKey: 'admin.features.quality_desc' },
      { titleKey: 'admin.features.partners', descKey: 'admin.features.partners_desc' },
      { titleKey: 'admin.features.insights', descKey: 'admin.features.insights_desc' },
    ],
    manager: [
      { titleKey: 'manager.features.castings', descKey: 'manager.features.castings_desc' },
      { titleKey: 'manager.features.workflow', descKey: 'manager.features.workflow_desc' },
      { titleKey: 'manager.features.portfolios', descKey: 'manager.features.portfolios_desc' },
      { titleKey: 'manager.features.team', descKey: 'manager.features.team_desc' },
    ],
    moderator: [
      { titleKey: 'moderator.features.review', descKey: 'moderator.features.review_desc' },
      { titleKey: 'moderator.features.rights', descKey: 'moderator.features.rights_desc' },
      { titleKey: 'moderator.features.safety', descKey: 'moderator.features.safety_desc' },
      { titleKey: 'moderator.features.feedback', descKey: 'moderator.features.feedback_desc' },
    ],
    premium: [
      { titleKey: 'premium.features.portfolio', descKey: 'premium.features.portfolio_desc' },
      { titleKey: 'premium.features.castings', descKey: 'premium.features.castings_desc' },
      { titleKey: 'premium.features.bookings', descKey: 'premium.features.bookings_desc' },
      { titleKey: 'premium.features.analytics', descKey: 'premium.features.analytics_desc' },
      { titleKey: 'premium.features.visibility', descKey: 'premium.features.visibility_desc' },
    ],
    free: [
      { titleKey: 'free.features.starter', descKey: 'free.features.starter_desc' },
      { titleKey: 'free.features.applications', descKey: 'free.features.applications_desc' },
    ],
    demo: [
      { titleKey: 'demo.features.tour', descKey: 'demo.features.tour_desc' },
      { titleKey: 'demo.features.preview', descKey: 'demo.features.preview_desc' },
    ],
  }), []);

  useEffect(() => {
    fetchUserData();
    fetchWorkspace();
    fetchChatMessages('community');
    fetchChatMessages('moderator');
    if (isUserTier) {
      fetchPortfolio();
    }
  }, []);

  useEffect(() => {
    if (!chatOpen) return;
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [channelMessages, chatOpen]);

  useEffect(() => {
    if (!workspace && userData) {
      const roleDefault = roleThemeMap[effectiveRole] || 'night-shade';
      setTheme(localStorage.getItem('theme') || roleDefault);
    }
  }, [effectiveRole, roleThemeMap, userData, workspace]);

  useEffect(() => {
    const body = document.body;
    body.classList.remove(
      'theme-aura',
      'theme-atelier',
      'theme-ivory',
      'theme-noir'
    );
    if (theme) {
      body.classList.add(`theme-${theme}`);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/v1/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        localStorage.setItem('user', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspace = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/v1/workspaces/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkspace(data);
        const rawRole = data.role === 'user' ? (data.subscription_tier || 'free') : data.role;
        const roleDefault = roleThemeMap[rawRole] || 'night-shade';
        const normalized = normalizeTheme(data.theme);
        setTheme(normalized || localStorage.getItem('theme') || roleDefault);
      }
    } catch (err) {
      console.error('Failed to fetch workspace:', err);
    }
  };

  const fetchChatMessages = async (channel) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/v1/chat/messages?channel=${channel}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => {
          const merged = [...prev];
          data.forEach((msg) => {
            if (!merged.find((existing) => existing.id === msg.id)) {
              merged.push(msg);
            }
          });
          return merged.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        });
      }
    } catch (err) {
      console.error('Failed to fetch chat messages:', err);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/v1/portfolio/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      }
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
    }
  };

  const handleThemeChange = async (nextTheme) => {
    setTheme(nextTheme);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiBaseUrl}/v1/workspaces/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ theme: nextTheme }),
      });
    } catch (err) {
      console.error('Failed to update theme:', err);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    sendMessage(chatTarget, chatInput.trim());
    setChatInput('');
  };

  const sendMessage = async (channel, content) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/v1/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ channel, content }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => (prev.find((msg) => msg.id === data.id) ? prev : [...prev, data]));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const base = apiBaseUrl.startsWith('http')
      ? apiBaseUrl
      : `${window.location.origin}${apiBaseUrl}`;
    const wsUrl = base.replace(/^http/, 'ws') + `/v1/chat/ws?token=${token}`;
    let socket;
    let poller;
    try {
      socket = new WebSocket(wsUrl);
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages((prev) => {
            if (prev.find((msg) => msg.id === data.id)) return prev;
            return [...prev, data];
          });
        } catch (err) {
          console.error('Failed to parse websocket message', err);
        }
      };
      socket.onerror = () => {
        poller = setInterval(() => {
          fetchChatMessages('community');
          fetchChatMessages('moderator');
        }, 5000);
      };
    } catch (err) {
      poller = setInterval(() => {
        fetchChatMessages('community');
        fetchChatMessages('moderator');
      }, 5000);
    }

    return () => {
      if (socket) socket.close();
      if (poller) clearInterval(poller);
    };
  }, [apiBaseUrl]);

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${apiBaseUrl}/v1/portfolio/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          setAssets((prev) => [data, ...prev]);
        }
      }
      await fetchPortfolio();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  return (
    <div className="dashboard-container">
      <div className="hero-section">
        <div className="hero-video-wrapper">
          <iframe
            className="hero-video"
            src="https://www.youtube.com/embed/yo6GklFH2sg?autoplay=1&mute=1&loop=1&playlist=yo6GklFH2sg&controls=0&modestbranding=1&rel=0&playsinline=1"
            title="ETERNELLES Workspace Hero"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <p className="hero-eyebrow">{t('dashboard.eyebrow')}</p>
          <h1 className="hero-title">{t('dashboard.welcome')}, {userData?.full_name || 'Utilisateur'}.</h1>
          <p className="hero-subtitle">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      <div className="dashboard-header">
        <div className="header-left">
          <h2 className="dashboard-title">{t('dashboard.title')}</h2>
          <p className="user-role">{t(`roles.${effectiveRole}`)}</p>
        </div>
        <div className="header-right">
          <button className="icon-button notification-btn">
            <span className="notification-icon">🔔</span>
            <span className="notification-badge">3</span>
          </button>
          <button className="icon-button settings-btn">⚙️</button>
          <button className="logout-button" onClick={handleLogout}>
            {t('dashboard.signOut')}
          </button>
        </div>
      </div>

      <div className="dashboard-nav">
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'workspaces' ? 'active' : ''}`}
            onClick={() => setActiveTab('workspaces')}
          >
            🎯 {t('dashboard.workspaces')}
          </button>
          {isUserTier && (
            <button
              className={`nav-tab ${activeTab === 'gamification' ? 'active' : ''}`}
              onClick={() => setActiveTab('gamification')}
            >
              ⭐ Gamification
            </button>
          )}
          {isUserTier && (
            <button
              className={`nav-tab ${activeTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              📸 Portfolio Book
            </button>
          )}
          {isUserTier && (
            <button
              className={`nav-tab ${activeTab === 'premium-workspace' ? 'active' : ''}`}
              onClick={() => setActiveTab('premium-workspace')}
            >
              ✨ Workspace Premium
            </button>
          )}
          <button
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 {t('dashboard.analytics')}
          </button>
          <button
            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ {t('dashboard.settings')}
          </button>
        </nav>
      </div>

      <div className="dashboard-content">
        {activeTab === 'workspaces' && (
          <div className="workspaces-section">
            <div className="section-header">
              <div>
                <h3>{t('dashboard.workspace')}</h3>
                <p className="workspace-subtitle">{workspace?.workspace_name || t('dashboard.workspace')}</p>
              </div>
              <button className="create-button">{t('dashboard.newWorkspace')}</button>
            </div>

            {workspace && (
              <div className="workspace-summary">
                <div className="workspace-meta">
                  <span className="meta-label">{t('dashboard.role')}</span>
                  <span className="meta-value">{t(`roles.${effectiveRole}`)}</span>
                </div>
                <div className="workspace-meta">
                  <span className="meta-label">{t('dashboard.theme')}</span>
                  <span className="meta-value">{workspace.theme}</span>
                </div>
                <div className="workspace-meta">
                  <span className="meta-label">{t('dashboard.widgets')}</span>
                  <span className="meta-value">{workspace.widgets?.length || 0}</span>
                </div>
              </div>
            )}
            <div className="workspaces-grid">
              {(featureMap[effectiveRole] || []).map((feature) => (
                <div key={feature.titleKey} className={`workspace-card ${effectiveRole}-card`}>
                  <div className="card-icon">✨</div>
                  <h4>{t(feature.titleKey)}</h4>
                  <p>{t(feature.descKey)}</p>
                  <button className="card-button">{t('cta.getStarted')}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gamification' && isUserTier && (
          <div className="gamification-section">
            <div className="section-header">
              <h3>Gamification</h3>
            </div>
            <div className="gamification-summary">
              <div className="level-card">
                <span>Niveau</span>
                <strong>{gamification.level}/10</strong>
              </div>
              <div className="level-card">
                <span>Score global</span>
                <strong>{gamification.score}</strong>
              </div>
              <div className="level-card">
                <span>Accès services</span>
                <strong>{gamification.level >= 7 ? 'Étendu' : gamification.level >= 4 ? 'Standard' : 'Restreint'}</strong>
              </div>
            </div>
            <div className="kpi-grid">
              <div className="kpi-card">
                <h4>Engagement plateforme</h4>
                <p>{gamification.engagement}%</p>
              </div>
              <div className="kpi-card">
                <h4>Communauté</h4>
                <p>{gamification.community}%</p>
              </div>
              <div className="kpi-card">
                <h4>Notes missions</h4>
                <p>{gamification.ratings}%</p>
              </div>
            </div>
            {gamification.warning && (
              <div className="kpi-warning">{gamification.warning}</div>
            )}
          </div>
        )}

        {activeTab === 'portfolio' && isUserTier && (
          <div className="portfolio-section">
            <div className="section-header">
              <div>
                <h3>Portfolio Book</h3>
                <p className="workspace-subtitle">Ajoutez vos images et vidéos, visibles instantanément.</p>
              </div>
              <label className="upload-button">
                {uploading ? 'Upload...' : 'Ajouter'}
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="portfolio-grid">
              {assets.length === 0 && (
                <div className="portfolio-empty">Aucun média pour le moment.</div>
              )}
              {resolvedAssets.map((asset) => (
                <div key={asset.id} className="portfolio-item">
                  <span className="asset-tag">{asset.file_type}</span>
                  {asset.file_type === 'video' ? (
                    <video src={asset.resolvedUrl} muted loop autoPlay playsInline controls />
                  ) : (
                    <img src={asset.resolvedUrl} alt="Portfolio" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'premium-workspace' && isUserTier && (
          <div className="premium-workspace-section">
            <PremiumWorkspaceTab />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <div className="section-header">
              <h3>{t('analytics.title')}</h3>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">2,459</div>
                <div className="stat-label">{t('stats.activeUsers')}</div>
                <div className="stat-change positive">{t('stats.activeUsersChange')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">894</div>
                 <div className="stat-label">{t('stats.projects')}</div>
                 <div className="stat-change positive">{t('stats.projectsChange')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">98.5%</div>
                 <div className="stat-label">{t('stats.uptime')}</div>
                 <div className="stat-change neutral">{t('stats.uptimeStatus')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">4.9</div>
                 <div className="stat-label">{t('stats.userRating')}</div>
                 <div className="stat-change positive">★★★★★</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <div className="section-header">
              <h3>{t('settings.title')}</h3>
            </div>

            <div className="settings-grid">
              <div className="settings-card">
                <h4>{t('settings.profile')}</h4>
                <div className="settings-item">
                  <label>Email</label>
                  <p>{userData?.email || 'N/A'}</p>
                </div>
                <div className="settings-item">
                  <label>{t('settings.name')}</label>
                  <p>{userData?.full_name || 'N/A'}</p>
                </div>
                <div className="settings-item">
                  <label>{t('settings.role')}</label>
                  <p>{t(`roles.${effectiveRole}`)}</p>
                </div>
                <button className="edit-button">{t('settings.editProfile')}</button>
              </div>

              <div className="settings-card">
                <h4>{t('settings.security')}</h4>
                <div className="settings-item">
                  <label>{t('settings.password')}</label>
                  <p>{t('settings.passwordHint')}</p>
                </div>
                <div className="settings-item">
                  <label>{t('settings.mfa')}</label>
                  <p>{t('settings.mfaStatus')}</p>
                </div>
                <button className="edit-button">{t('settings.updateSecurity')}</button>
              </div>

              <div className="settings-card">
                <h4>{t('settings.preferences')}</h4>
                <div className="settings-item">
                  <label>{t('settings.theme')}</label>
                  <p>{t('settings.themeDefault')}</p>
                </div>
                <div className="settings-item">
                  <label>{t('settings.notifications')}</label>
                  <p>{t('settings.notificationsStatus')}</p>
                </div>
                <button className="edit-button">{t('settings.managePreferences')}</button>
              </div>

              <div className="settings-card danger-zone">
                <h4>{t('settings.dangerZone')}</h4>
                <p>{t('settings.dangerDesc')}</p>
                <button className="delete-button">{t('settings.deleteAccount')}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`chat-panel ${chatOpen ? '' : 'collapsed'}`}>
        {chatOpen ? (
          <>
            <div className="chat-header">
              <div className="chat-header-top">
                <div>
                  <h4>Salon ETERNELLES</h4>
                  <p className="chat-subtitle">
                    {chatTarget === 'community' ? 'Discussion entre talents' : 'Canal avec le modérateur'}
                  </p>
                </div>
                <button
                  type="button"
                  className="chat-collapse-button"
                  onClick={() => setChatOpen(false)}
                  aria-label="Réduire le chat"
                >
                  —
                </button>
              </div>
              <div className="chat-toggle">
                <button
                  type="button"
                  className={chatTarget === 'community' ? 'active' : ''}
                  onClick={() => setChatTarget('community')}
                >
                  Communauté
                </button>
                <button
                  type="button"
                  className={chatTarget === 'moderator' ? 'active' : ''}
                  onClick={() => setChatTarget('moderator')}
                >
                  Modérateur
                </button>
              </div>
            </div>
            <div className="chat-body">
              {channelMessages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${message.user_id === userData?.id ? 'own' : ''}`}
                >
                  <div className="chat-meta">
                    <span className="chat-user">
                      {message.user_id === userData?.id ? 'Vous' : (message.user_name || message.from || 'Anonyme')}
                    </span>
                    <span className="chat-time">{formatChatTime(message.created_at) || message.timestamp}</span>
                  </div>
                  <p>{message.content}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Écrivez un message..."
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSendMessage();
                }}
              />
              <button type="button" onClick={handleSendMessage}>Envoyer</button>
            </div>
          </>
        ) : (
          <button
            type="button"
            className="chat-collapsed"
            onClick={() => setChatOpen(true)}
          >
            <strong>Chat ETERNELLES</strong>
            <span>{lastMessagePreview}</span>
          </button>
        )}
      </div>
    </div>
  );
}

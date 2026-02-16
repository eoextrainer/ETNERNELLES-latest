import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './HomeScreen.css';

const modelImageMap = import.meta.glob('../../../tmp/models/*.{webp,png,jpg,jpeg}', {
  eager: true,
  as: 'url',
});
const modelImages = Object.entries(modelImageMap)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, url]) => url);

const SpotlightCard = ({ name, subtitle, imageUrl }) => (
  <div className="spotlight-card">
    <div className="spotlight-image">
      <img src={imageUrl} alt={name} loading="lazy" />
    </div>
    <div className="spotlight-copy">
      <h3>{name}</h3>
      <p>{subtitle}</p>
    </div>
  </div>
);

export default function WorkspaceScreen({ user, onBack }) {
  const { t } = useTranslation();
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className="home-screen">
      <nav className="home-nav">
        <div className="nav-brand">
          <h1>ETERNELLES</h1>
          <p>{t('app.title')}</p>
        </div>

        <button
          className={`nav-toggle ${navOpen ? 'active' : ''}`}
          onClick={() => setNavOpen(!navOpen)}
          type="button"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="nav-center-group">
          <ul className={`nav-menu ${navOpen ? 'active' : ''}`}>
            <li><a href="#evenements">{t('navigation.events')}</a></li>
            <li className="nav-separator">|</li>
            <li><a href="#createurs">{t('navigation.creators')}</a></li>
            <li className="nav-separator">|</li>
            <li><a href="#talents">{t('navigation.talents')}</a></li>
            <li className="nav-separator">|</li>
            <li><a href="#formulaire">{t('navigation.formulaire')}</a></li>
          </ul>
        </div>
      </nav>

      <div className="home-content">
        <button className="back-btn" onClick={onBack}>Back</button>

        {/* User Info Section */}
        {user && (
          <section className="user-info-section">
            <h2>Bienvenue, {user.name || user.username || user.email}!</h2>
            <p>Email: {user.email}</p>
            {/* Add more user info fields as needed */}
          </section>
        )}

        <section className="spotlight-section" id="workspace-spotlight">
          <div className="section-heading">
            <h2>{t('sections.spotlight')}</h2>
            <p>{t('sections.spotlightSubtitle')}</p>
          </div>
          <div className="spotlight-grid">
            {[...Array(11)].map((_, i) => (
              <SpotlightCard
                key={i}
                name={`Modèle ${String(i + 1).padStart(2, '0')}`}
                subtitle={t('labels.featuredRole') || "Talent éditorial & runway"}
                imageUrl={modelImages[i % modelImages.length]}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

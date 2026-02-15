import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './HomeScreen.css';

const getVideoId = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('v');
  } catch (err) {
    return '';
  }
};

const buildEmbedUrl = (url) => {
  const id = getVideoId(url);
  if (!id) return '';
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&fs=0&loop=1&playlist=${id}`;
};

const VideoCarousel = ({ title, subtitle, videos, startAt }) => {
  // Only show a single video, no arrows
  const current = buildEmbedUrl(videos[0]) + (startAt ? `&start=${startAt}` : '');
  return (
    <div className="carousel">
      <div className="carousel-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className="carousel-frame">
        <iframe
          className="carousel-video"
          key={current}
          src={current}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

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

export default function HomeScreen({ onLoginClick }) {
  const { t } = useTranslation();
  const [navOpen, setNavOpen] = useState(false);
  const spotlightModels = useMemo(
    () =>
      modelImages.map((_, index) =>
        `Modèle ${String(index + 1).padStart(2, '0')}`
      ),
    []
  );

  const heroVideo = 'https://www.youtube.com/watch?v=5Tc4ruN1xR8&pp=ygUeZmFzaGlvbiBtb2RlbGxpbmcgZmFzaGlvbiB3ZWVr';

  // Updated caroussel videos per section
  const eventsVideos = useMemo(() => [
    'https://www.youtube.com/watch?v=EsHLkyvLqU8'
  ], []);

  const creatorsVideos = useMemo(() => [
    'https://www.youtube.com/watch?v=uE0fuzYKV9U&pp=ygUvd29tZW4gZGFuY2luZyBhbmQgYWNyb2JhdGluZyBzaG93Y2FzZSBkZW1vIHJlZWw%3D'
  ], []);

  const talentsVideos = useMemo(() => [
    'https://www.youtube.com/watch?v=lXWJ6xY14x0&pp=ygU2d29tZW4gZmFzaGlvbiBtb2RlbGxpbmcgcnVud2F5IHNob3cgc2hvd2Nhc2UgZGVtbyByZWVs'
  ], []);

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
            <li className="nav-separator">|</li>
            <li><a href="#kiosk">{t('navigation.kiosk')}</a></li>
          </ul>
        </div>

        <div className="nav-login-group">
          <button
            className="nav-login-btn"
            onClick={onLoginClick}
            type="button"
          >
            {t('home.login')}
          </button>
        </div>
      </nav>

      <section className="hero-section" id="hero">
        <div className="hero-video-wrapper">
          <iframe
            className="hero-video"
            src={buildEmbedUrl(heroVideo) + '&start=15'}
            title="ETERNELLES Hero"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <p className="hero-eyebrow">{t('home.heroEyebrow')}</p>
          <h1 className="hero-title">{t('home.heroTitle')}</h1>
          <p className="hero-subtitle">{t('home.heroSubtitle')}</p>
          <div className="hero-actions">
            <button className="cta-button" onClick={onLoginClick} type="button">
              {t('home.getStarted')}
            </button>
            <button className="ghost-button" type="button">
              {t('home.exploreBook')}
            </button>
          </div>
        </div>
      </section>

      <section className="spotlight-section" id="spotlight-grid">
        <div className="section-heading">
          <h2>{t('sections.spotlight')}</h2>
          <p>{t('sections.spotlightSubtitle')}</p>
        </div>
        <div className="spotlight-grid">
          {spotlightModels.map((name, index) => (
            <SpotlightCard
              key={modelImages[index]}
              name={name}
              subtitle={t('labels.featuredRole')}
              imageUrl={modelImages[index]}
            />
          ))}
        </div>
      </section>

      <section className="carousel-section" id="evenements">
        <VideoCarousel
          title={t('sections.events')}
          subtitle={t('sections.eventsSubtitle')}
          videos={eventsVideos}
        />
      </section>

      <section className="carousel-section" id="createurs">
        <VideoCarousel
          title={t('sections.creators')}
          subtitle={t('sections.creatorsSubtitle')}
          videos={creatorsVideos}
          startAt={15}
        />
      </section>

      <section className="carousel-section" id="talents">
        <VideoCarousel
          title={t('sections.talents')}
          subtitle={t('sections.talentsSubtitle')}
          videos={talentsVideos}
          startAt={10}
        />
      </section>


      {/* Registration Form Section */}
      <section className="form-section" id="formulaire">
        <div className="form-card">
          <h2>{t('registration.title')}</h2>
          <form>
            <div className="form-row">
              <label htmlFor="prenom">{t('registration.prenom')}</label>
              <input type="text" id="prenom" name="prenom" required />
            </div>
            <div className="form-row">
              <label htmlFor="nom">{t('registration.nom')}</label>
              <input type="text" id="nom" name="nom" required />
            </div>
            <div className="form-row">
              <label htmlFor="email">{t('registration.email')}</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-row">
              <label htmlFor="ville">{t('registration.ville')}</label>
              <input type="text" id="ville" name="ville" required />
            </div>
            <div className="form-row">
              <label htmlFor="pays">{t('registration.pays')}</label>
              <input type="text" id="pays" name="pays" required />
            </div>
            <div className="form-row">
              <label htmlFor="category">{t('registration.category')}</label>
              <select id="category" name="category" required>
                <option value="">--</option>
                <option value="spectateur">{t('registration.categoryOptions.spectateur')}</option>
                <option value="vip">{t('registration.categoryOptions.vip')}</option>
                <option value="sponsor">{t('registration.categoryOptions.sponsor')}</option>
                <option value="talent">{t('registration.categoryOptions.talent')}</option>
                <option value="direction">{t('registration.categoryOptions.direction')}</option>
              </select>
            </div>
            <div className="form-row">
              <button type="submit" className="cta-button">{t('registration.submit')}</button>
            </div>
          </form>
        </div>
      </section>

      {/* Placeholder for KIOSK section */}
      <section className="kiosk-section" id="kiosk">
        <div className="kiosk-placeholder">
          <h2>KIOSK</h2>
          <p>Section à venir...</p>
        </div>
      </section>

    </div>
  );
}

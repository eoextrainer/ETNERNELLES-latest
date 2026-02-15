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

const VideoCarousel = ({ title, subtitle, videos }) => {
  const [index, setIndex] = useState(0);
  const total = videos.length;
  const current = buildEmbedUrl(videos[index]);

  const handleNext = () => setIndex((prev) => (prev + 1) % total);
  const handlePrev = () => setIndex((prev) => (prev - 1 + total) % total);

  return (
    <div className="carousel">
      <div className="carousel-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className="carousel-frame">
        <button
          type="button"
          className="carousel-nav prev"
          onClick={handlePrev}
          aria-label="Previous"
        >
          ‹
        </button>
        <iframe
          className="carousel-video"
          key={current}
          src={current}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
        <button
          type="button"
          className="carousel-nav next"
          onClick={handleNext}
          aria-label="Next"
        >
          ›
        </button>
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

  const eventsVideos = useMemo(
    () => [
      'https://www.youtube.com/watch?v=5D0i7mtlqLs&pp=ygUeZmFzaGlvbiBtb2RlbGxpbmcgZmFzaGlvbiB3ZWVr',
      'https://www.youtube.com/watch?v=Nq-taA3DQEE&pp=ygUeZmFzaGlvbiBtb2RlbGxpbmcgZmFzaGlvbiB3ZWVr',
      'https://www.youtube.com/watch?v=CwmKr-wkj1M&pp=ygUeZmFzaGlvbiBtb2RlbGxpbmcgZmFzaGlvbiB3ZWVr2AYL',
      'https://www.youtube.com/watch?v=HfJgt9oEXms&pp=ygUeZmFzaGlvbiBtb2RlbGxpbmcgZmFzaGlvbiB3ZWVr',
      'https://www.youtube.com/watch?v=vK3Jq8AJO5s&pp=ygUeZmFzaGlvbiBtb2RlbGxpbmcgZmFzaGlvbiB3ZWVr',
      'https://www.youtube.com/watch?v=25956Au5n8Y&pp=ygUeZmFzaGlvbiBtb2RlbGxpbmcgZmFzaGlvbiB3ZWVr',
      'https://www.youtube.com/watch?v=6eCl9q2x77U&pp=ygUeZmFzaGlvbiBtb2RlbGxpbmcgZmFzaGlvbiB3ZWVr',
    ],
    []
  );

  const creatorsVideos = useMemo(
    () => [
      'https://www.youtube.com/watch?v=W-lPWow1lz8&pp=ygUbZmFzaGlvbiBtb2RlbGxpbmcgZGVzaWduZXJz0gcJCZEKAYcqIYzv',
      'https://www.youtube.com/watch?v=pDnNcktioxc&pp=ygUbZmFzaGlvbiBtb2RlbGxpbmcgZGVzaWduZXJz',
      'https://www.youtube.com/watch?v=N175V2OK3K0&pp=ygUbZmFzaGlvbiBtb2RlbGxpbmcgZGVzaWduZXJz',
      'https://www.youtube.com/watch?v=hoKDrFyQDy0&pp=ygUbZmFzaGlvbiBtb2RlbGxpbmcgZGVzaWduZXJz',
      'https://www.youtube.com/watch?v=A0uAr8H1dWU&pp=ygUbZmFzaGlvbiBtb2RlbGxpbmcgZGVzaWduZXJz',
      'https://www.youtube.com/watch?v=OFb4IFpZdx0&pp=ygUbZmFzaGlvbiBtb2RlbGxpbmcgZGVzaWduZXJz',
      'https://www.youtube.com/watch?v=y6NGVqahOOE&pp=ygUbZmFzaGlvbiBtb2RlbGxpbmcgZGVzaWduZXJz',
    ],
    []
  );

  const talentsVideos = useMemo(
    () => [
      'https://www.youtube.com/watch?v=cFIu-rPe9Pg&pp=ygUbZmFzaGlvbiBtb2RlbGxpbmcgZGVzaWduZXJz',
      'https://www.youtube.com/watch?v=afbCCkgVGHY&pp=ygUbZmFzaGlvbiBtb2RlbGxpbmcgZGVzaWduZXJz',
      'https://www.youtube.com/watch?v=DlKsYHC8QAw&pp=ygUbZmFzaGlvbiBtb2RlbGxpbmcgZGVzaWduZXJz',
      'https://www.youtube.com/watch?v=UYDrMA16248&pp=ygUbZmFzaGlvbiBtb2RlbGxpbmcgZGVzaWduZXJz0gcJCZEKAYcqIYzv',
      'https://www.youtube.com/watch?v=QPuH-2YXv_A&pp=ygUbZmFzaGlvbiBtb2RlbGxpbmcgZGVzaWduZXJz',
    ],
    []
  );

  const universeVideos = useMemo(() => [heroVideo], [heroVideo]);

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

        <ul className={`nav-menu ${navOpen ? 'active' : ''}`}>
          <li><a href="#evenements">{t('navigation.events')}</a></li>
          <li><a href="#createurs">{t('navigation.creators')}</a></li>
          <li><a href="#talents">{t('navigation.talents')}</a></li>
          <li><a href="#univers">{t('navigation.universe')}</a></li>
          <li>
            <button
              className="nav-login-btn"
              onClick={onLoginClick}
              type="button"
            >
              {t('home.login')}
            </button>
          </li>
        </ul>
      </nav>

      <section className="hero-section" id="hero">
        <div className="hero-video-wrapper">
          <iframe
            className="hero-video"
            src={buildEmbedUrl(heroVideo)}
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
        />
      </section>

      <section className="carousel-section" id="talents">
        <VideoCarousel
          title={t('sections.talents')}
          subtitle={t('sections.talentsSubtitle')}
          videos={talentsVideos}
        />
      </section>

      <section className="carousel-section" id="univers">
        <VideoCarousel
          title={t('sections.universe')}
          subtitle={t('sections.universeCopy')}
          videos={universeVideos}
        />
      </section>

    </div>
  );
}

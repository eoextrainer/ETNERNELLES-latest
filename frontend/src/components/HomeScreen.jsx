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
          </ul>
        </div>

        <div className="nav-login-group" style={{ marginLeft: 'auto' }}>
          <button
            className="ghost-button"
            onMouseOver={e => { e.currentTarget.style.color = 'black'; }}
            onMouseOut={e => { e.currentTarget.style.color = ''; }}
            onClick={onLoginClick}
            type="button"
          >
            CONNECTEZ VOUS
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
                {/* ExploreBook ghost-button removed */}
            {/* Connectez vous ghost-button removed */}
          </div>
        </div>
      </section>

      {/* Elegant Google Map Card before Spotlight section */}
      <section className="map-card-section">
        <div className="map-card map-card--fullmap">
          <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:'700',marginBottom:'1rem'}}>Notre emplacement</h2>
          <div className="map-card-iframe-wrapper" style={{height:'500px',width:'100%'}}>
            <iframe
              title="Google Map - 2 Rue de Saint-Gobain, 37700 Saint-Pierre-des-Corps"
              className="map-card-iframe"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=2+Rue+de+Saint-Gobain,+37700+Saint-Pierre-des-Corps&output=embed"
              style={{width:'100%',height:'100%',border:'none',display:'block'}}
            />
          </div>
          <div style={{textAlign:'center',marginTop:'1rem',fontSize:'1.1rem',color:'#555'}}>2 Rue de Saint-Gobain, 37700 Saint-Pierre-des-Corps</div>
        </div>
      </section>



      <section className="carousel-section" id="evenements">
        <VideoCarousel
          title={t('sections.events')}
          subtitle={t('sections.eventsSubtitle')}
          videos={eventsVideos}
        />
        {/* Custom Modèle cards below Basketball/La femme en mouvement */}
        <div className="spotlight-grid" style={{marginTop:'2rem'}}>
          <SpotlightCard
            name="Concourt de Tirs"
            subtitle="Avec rapidité et précision"
            imageUrl={"/res/images/e72390d2-1060-4b1a-8f88-5b813ccee22a_750x422.jpg"}
          />
          <SpotlightCard
            name="Systèmes de Basket"
            subtitle="Clefs du jeu stratégique"
            imageUrl={"/res/images/dribbling-drills-to-practice-before-you-play-basketball.avif"}
          />
          <SpotlightCard
            name="Concours de Dunk"
            subtitle="Survoler la défense"
            imageUrl={"/res/images/13382955_web1_All-Star-Saturday-Basketball-2-1-4.webp"}
          />
        </div>
      </section>


      <section className="carousel-section" id="createurs">
        <VideoCarousel
          title={t('sections.creators')}
          subtitle={t('sections.creatorsSubtitle')}
          videos={creatorsVideos}
          startAt={15}
        />
        {/* Custom Modèle cards below Danse et Spectacles / La femme au rythme de son corps */}
        <div className="spotlight-grid" style={{marginTop:'2rem'}}>
          <div className="spotlight-card">
            <div className="spotlight-image">
              <img src="/res/images/male-and-female-dancers-in-mid-air.jpg" alt="Spectacles et danses acrobatiques" loading="lazy" />
            </div>
            <div className="spotlight-copy">
              <h3>Danses acrobatiques</h3>
              <p><a href="https://www.emmalines.com" target="_blank" rel="noopener noreferrer">Emmalines</a></p>
            </div>
          </div>
          <div className="spotlight-card">
            <div className="spotlight-image">
              <img src="/res/images/11062b_05c36194c6bb4038a4d02a2dae529e28~mv2.avif" alt="Danses Afro" loading="lazy" />
            </div>
            <div className="spotlight-copy">
              <h3>Danses Afro</h3>
              <p><a href="#" target="_blank" rel="noopener noreferrer">Fetch Asso</a></p>
            </div>
          </div>
          <div className="spotlight-card">
            <div className="spotlight-image">
              <img src="/res/images/b3f077b4e7cad49870b9.webp" alt="Rhytmes Latino" loading="lazy" />
            </div>
            <div className="spotlight-copy">
              <h3>Rhytmes Latino</h3>
              <p>Sales en Vivo</p>
            </div>
          </div>
        </div>
      </section>


      <section className="carousel-section" id="talents">
        <VideoCarousel
          title={t('sections.talents')}
          subtitle={t('sections.talentsSubtitle')}
          videos={talentsVideos}
          startAt={20}
          endOffset={10}
        />
        {/* Custom Modèle cards below Défile de Mode / La femme sous toutes ses couleurs */}
        <div className="spotlight-grid" style={{marginTop:'2rem'}}>
          <SpotlightCard
            name="Défilé Intemporel"
            subtitle="Talent éditorial & runway"
            imageUrl={"/res/images/6F3A4916-scaled.jpg"}
          />
          <SpotlightCard
            name="Couture Contemporaine"
            subtitle="La mode au fil du temps"
            imageUrl={"/res/images/Louis-Vuittons-spring-2020-show.-vogue.jpg"}
          />
          <SpotlightCard
            name="Les Horizons de la Mode"
            subtitle="Beauté, Classe, et Style au naturel"
            imageUrl={"/res/images/Max Mara SS26 14.jpg"}
          />
        </div>
      </section>



      {/* Registration Form and KIOSK side by side */}
      <section className="form-kiosk-row">
        <div className="form-section" id="formulaire">
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
        </div>
        <div className="kiosk-section" id="kiosk">
          <div className="pricing-table-card">
            <h2 style={{textAlign:'center',fontSize:'2rem',fontWeight:'700',marginBottom:'1.5rem'}}>Tarifs</h2>
            <div className="pricing-table-grid">
              <div className="pricing-card">
                <h3>Individuel</h3>
                <div className="pricing-price">10&nbsp;€</div>
                <div className="pricing-desc">Accès valable pour toute la journée</div>
              </div>
              <div className="pricing-card">
                <h3>Famille</h3>
                <div className="pricing-price">35&nbsp;€</div>
                <div className="pricing-desc">Jusqu'à 4 personnes<br/>Accès valable pour toute la journée<br/>+ espace famille dédié</div>
              </div>
              <div className="pricing-card">
                <h3>Groupe</h3>
                <div className="pricing-price">80&nbsp;€</div>
                <div className="pricing-desc">Jusqu'à 10 personnes<br/>Accès valable pour toute la journée<br/>+ espace groupe dédié</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

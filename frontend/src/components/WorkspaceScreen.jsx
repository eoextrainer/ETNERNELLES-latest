import React from 'react';
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

export default function WorkspaceScreen({ onBack }) {
  return (
    <div className="home-container">
      <div className="home-header">
        <h1>WORKSPACE</h1>
      </div>
      <div className="home-content">
        <button className="back-btn" onClick={onBack}>Back</button>

        <section className="spotlight-section" id="workspace-spotlight">
          <div className="section-heading">
            <h2>En vedette</h2>
            <p>Une sélection de talents émergents et établis.</p>
          </div>
          <div className="spotlight-grid">
            {[...Array(11)].map((_, i) => (
              <SpotlightCard
                key={i}
                name={`Modèle ${String(i + 1).padStart(2, '0')}`}
                subtitle={"Talent éditorial & runway"}
                imageUrl={modelImages[i % modelImages.length]}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import './ThemeSelector.css';

const THEMES = [
  {
    id: 'aura',
    labelKey: 'themes.aura',
    descriptionKey: 'themes.auraDesc',
  },
  {
    id: 'atelier',
    labelKey: 'themes.atelier',
    descriptionKey: 'themes.atelierDesc',
  },
  {
    id: 'ivory',
    labelKey: 'themes.ivory',
    descriptionKey: 'themes.ivoryDesc',
  },
  {
    id: 'noir',
    labelKey: 'themes.noir',
    descriptionKey: 'themes.noirDesc',
  },
];

export default function ThemeSelector({ currentTheme, onThemeChange }) {
  const { t } = useTranslation();
  return (
    <div className="theme-selector">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          className={`theme-card ${currentTheme === theme.id ? 'active' : ''}`}
          onClick={() => onThemeChange(theme.id)}
        >
          <div className={`theme-swatch theme-${theme.id}`} />
          <div className="theme-info">
            <h5>{t(theme.labelKey)}</h5>
            <p>{t(theme.descriptionKey)}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

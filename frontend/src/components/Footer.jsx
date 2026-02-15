import React from 'react';
import { useTranslation } from 'react-i18next';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="site-footer" id="about">
      <div className="footer-grid">
        <div className="footer-section">
          <h3>ETERNELLES</h3>
          <p>{t('footer.about')}</p>
          <p>{t('footer.aboutSub')}</p>
        </div>
        <div className="footer-section">
          <h3>{t('footer.legal')}</h3>
          <p><a href="#">{t('footer.legalNotice')}</a></p>
          <p><a href="#">{t('footer.terms')}</a></p>
          <p><a href="#">{t('footer.privacy')}</a></p>
        </div>
        <div className="footer-section">
          <h3>{t('footer.social')}</h3>
          <p><a href="#">Instagram</a></p>
          <p><a href="#">YouTube</a></p>
          <p><a href="#">TikTok</a></p>
          <p><a href="#">LinkedIn</a></p>
        </div>
        <div className="footer-section">
          <h3>{t('footer.faq')}</h3>
          <p><a href="#">{t('footer.faqLink')}</a></p>
          <p><a href="#">{t('footer.booking')}</a></p>
          <p><a href="#">{t('footer.services')}</a></p>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} ETERNELLES</div>
    </footer>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import './LoginPage.css';


import { useAuth } from '../context/AuthContext';

export default function LoginModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const modalRef = useRef(null);

  // Position modal below CONNECTEZ VOUS CTA
  useEffect(() => {
    if (!open) return;
    const cta = document.querySelector('.ghost-button');
    const modal = modalRef.current;
    if (cta && modal) {
      const rect = cta.getBoundingClientRect();
      const modalWidth = modal.offsetWidth;
      const modalHeight = modal.offsetHeight;
      let top = rect.bottom + window.scrollY + 8;
      let left = rect.left + window.scrollX;
      // Ensure modal is fully in viewport horizontally
      if (left + modalWidth > window.innerWidth - 16) {
        left = window.innerWidth - modalWidth - 16;
      }
      if (left < 8) left = 8;
      // Ensure modal is fully in viewport vertically
      if (top + modalHeight > window.innerHeight + window.scrollY - 16) {
        top = rect.top + window.scrollY - modalHeight - 8;
        if (top < 8) top = 8;
      }
      modal.style.position = 'absolute';
      modal.style.top = `${top}px`;
      modal.style.left = `${left}px`;
      modal.style.zIndex = 10000;
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={modalRef}
      className="login-modal-premium-card"
    >
      <button className="login-modal-close" onClick={onClose}>&times;</button>
      <h2 className="login-modal-title">IDENTIFIEZ VOUS</h2>
      <div className="login-modal-sample-creds">
        <span>Exemple : </span>
        <span className="login-modal-sample-email">admin@travel.com</span>
        <span className="login-modal-sample-password">mot de passe : <b>admin</b></span>
      </div>
      <form onSubmit={handleSubmit}>
        <label className="login-modal-label">Email</label>
        <input className="login-modal-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label className="login-modal-label">Mot de passe</label>
        <input className="login-modal-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <div className="login-modal-error">{error}</div>}
        <div className="login-modal-submit-row">
          <button className="login-modal-submit-premium" type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>
      </form>
    </div>
  );
}

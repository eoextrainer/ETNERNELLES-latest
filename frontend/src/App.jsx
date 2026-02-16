import React, { useState, useEffect } from 'react';
import LoginModal from './components/LoginPage';
import { useAuth } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import SplashScreen from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import Dashboard from './components/Dashboard';
import WorkspaceScreen from './components/WorkspaceScreen';
import Footer from './components/Footer';
import './App.css';

function App() {
  const { t } = useTranslation();
  const { user, login, logout, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('splash');
  const [showLogin, setShowLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[App] user state changed:', user);
    if (user) {
      setCurrentPage('workspace');
    } else {
      setCurrentPage('splash');
    }
    setIsLoading(false);
  }, [user]);

  const handleSplashComplete = () => {
    console.log('[App] Splash complete, navigating to home');
    setCurrentPage('home');
  };
  const handleLoginClick = () => {
    console.log('[App] CONNECTEZ VOUS CTA clicked');
    setShowLogin(true);
  };
  // Login is now handled in LoginModal, no need for handleLogin here
  const handleLogout = () => {
    logout();
    setCurrentPage('splash');
  };

  if (isLoading) {
    return <div className="loading-screen">{t('app.tagline')}</div>;
  }
  const showFooter = currentPage !== 'splash';
  return (
    <div className="app">
      <main className="app-main">
        {currentPage === 'splash' && <SplashScreen onComplete={handleSplashComplete} />}
        {currentPage === 'home' && <HomeScreen onLoginClick={handleLoginClick} />}
        {currentPage === 'workspace' && user && <WorkspaceScreen user={user} onBack={() => setCurrentPage('home')} />}
        {currentPage === 'dashboard' && user && <Dashboard user={user} onLogout={handleLogout} />}
        <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

export default App;

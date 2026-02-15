import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SplashScreen from './components/SplashScreen';
import LoginPage from './components/LoginPage';
import HomeScreen from './components/HomeScreen';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import './App.css';

function App() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState('splash');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && storedUser !== 'undefined' && storedUser !== 'null' && token) {
      try {
        setUser(JSON.parse(storedUser));
        setCurrentPage('dashboard');
      } catch (err) {
        console.error('Error parsing stored user:', err);
        setCurrentPage('splash');
      }
    } else {
      setCurrentPage('splash');
    }
    setIsLoading(false);
  }, []);

  const handleSplashComplete = () => {
    setCurrentPage('home');
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLoginClick = () => {
    setCurrentPage('login');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentPage('splash');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <div className="loading-screen">{t('app.tagline')}</div>;
  }

  const showFooter = currentPage !== 'splash';

  return (
    <div className="app">
      <main className="app-main">
        {currentPage === 'splash' && (
          <SplashScreen onComplete={handleSplashComplete} />
        )}
        
        {currentPage === 'home' && (
          <HomeScreen onLoginClick={handleLoginClick} />
        )}
        
        {currentPage === 'login' && (
          <LoginPage onLogin={handleLogin} />
        )}
        
        {currentPage === 'dashboard' && user && (
          <Dashboard user={user} onLogout={handleLogout} />
        )}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

export default App;

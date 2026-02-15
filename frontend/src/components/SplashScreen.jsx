import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './SplashScreen.css';

export default function SplashScreen({ onComplete }) {
  const { t } = useTranslation();
  const [fadeOut, setFadeOut] = useState(false);

  const splashVideos = useMemo(
    () => [
      'https://www.youtube.com/watch?v=oA3mA-rsKWo',
    ],
    []
  );

  const getVideoId = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.searchParams.get('v');
    } catch (err) {
      return '';
    }
  };

  const getEmbedUrl = (url) => {
    const id = getVideoId(url);
    if (!id) return '';
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&fs=0&loop=1&playlist=${id}`;
  };

  const [selectedVideo, setSelectedVideo] = useState(
    () => getEmbedUrl(splashVideos[0])
  );

  useEffect(() => {
    const randomVideo = splashVideos[Math.floor(Math.random() * splashVideos.length)];
    setSelectedVideo(getEmbedUrl(randomVideo));

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onComplete?.();
      }, 500);
    }, 10000);

    return () => clearTimeout(timer);
  }, [onComplete, splashVideos]);

  const handleSkip = () => {
    setFadeOut(true);
    setTimeout(() => {
      onComplete?.();
    }, 300);
  };

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="noise"></div>
      <div className="splash-video-container">
        <iframe
          className="splash-video"
          src={selectedVideo}
          title="ETERNELLES Splash"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      <div className="splash-overlay"></div>

      <div className="splash-content">
        <h1 className="splash-title">ETERNELLES</h1>
        <p className="splash-subtitle">8 Mars 2026 à Tours (Indre et Loire)</p>
        <button type="button" className="splash-skip" onClick={handleSkip}>
          BIENVENU
        </button>
      </div>

      {/* Timer indicator */}
      <div className="splash-timer">
        <div className="timer-bar"></div>
      </div>
    </div>
  );
}

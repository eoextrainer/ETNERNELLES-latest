import React, { useMemo, useState } from 'react';

const Icon = ({ label, size = 16, color = '#6B7280' }) => (
  <span style={{ fontSize: size, color, lineHeight: 1, display: 'inline-flex' }}>{label}</span>
);

const Clock = (props) => <Icon label="🕒" {...props} />;
const MapPin = (props) => <Icon label="📍" {...props} />;
const MoreHorizontal = (props) => <Icon label="⋯" {...props} />;
const Award = (props) => <Icon label="🏆" {...props} />;
const Zap = (props) => <Icon label="⚡" {...props} />;
const TrendingUp = (props) => <Icon label="📈" {...props} />;
const Target = (props) => <Icon label="🎯" {...props} />;
const Heart = (props) => <Icon label="❤" {...props} />;
const MessageCircle = (props) => <Icon label="💬" {...props} />;
const Send = (props) => <Icon label="✈️" {...props} />;
const Bookmark = (props) => <Icon label="🔖" {...props} />;

const getCompanyTypeLabel = (type) => {
  switch (type) {
    case 'brand':
      return { label: 'Marque', icon: '🏷️', color: '#8B5CF6' };
    case 'agency':
      return { label: 'Agence', icon: '🏢', color: '#3B82F6' };
    case 'photographer':
      return { label: 'Photographe', icon: '📷', color: '#EC4899' };
    default:
      return { label: 'Studio', icon: '✨', color: '#10B981' };
  }
};

const getCategoryColor = (category) => {
  switch (category) {
    case 'Défilé':
      return '#111827';
    case 'Casting':
      return '#3B82F6';
    case 'Workshop':
      return '#8B5CF6';
    case 'Networking':
      return '#EC4899';
    case 'Salon':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
};

const collaborationPosts = [
  {
    id: 1,
    company: { name: 'Maison Étoile', logo: 'ME', verified: true },
    type: 'brand',
    time: '2h',
    title: 'Campagne Printemps-Été 2026',
    description: 'Recherche modèles pour campagne internationale. Shooting éditorial à Paris.',
    images: [
      { type: 'lookbook', color: '#C8956B' },
      { type: 'studio', color: '#B8805A' },
      { type: 'mood', color: '#E5D3C2' },
    ],
    requirements: ['Taille 1m70+','Expérience éditoriale','Disponibilité février'],
    compensation: 'Rémunéré',
    location: 'Paris',
    applicants: 42,
  },
  {
    id: 2,
    company: { name: 'Studio Lumière', logo: 'SL', verified: true },
    type: 'photographer',
    time: '4h',
    title: 'Editorial Beauté - Projet portfolio',
    description: 'Shooting beauté TFP pour enrichir votre book et notre portfolio.',
    images: [
      { type: 'beauty', color: '#F3D6E2' },
      { type: 'portrait', color: '#E7C5D7' },
    ],
    requirements: ['Peau naturelle','Disponibilité week-end'],
    compensation: 'TFP',
    location: 'Lyon',
    applicants: 18,
  },
  {
    id: 3,
    company: { name: 'Agence Nouvelle', logo: 'AN', verified: false },
    type: 'agency',
    time: '1j',
    title: 'Casting silhouettes haute couture',
    description: 'Casting pour silhouettes couture. Première sélection sur book.',
    images: [{ type: 'couture', color: '#111827' }],
    requirements: ['Mensurations précises','Book mis à jour'],
    compensation: 'Casting',
    location: 'Paris',
    applicants: 64,
  },
];

const posts = [
  {
    id: 1,
    user: { name: 'Sophie Laurent', avatar: 'SL', location: 'Paris, France' },
    content: 'Exploring hidden gems in the city today. The architecture here never fails to amaze me! 🏛️ Found this stunning courtyard tucked away in Le Marais.',
    images: [
      { type: 'architecture', color: '#E8DED2' },
      { type: 'courtyard', color: '#D4C5B9' },
      { type: 'details', color: '#C9B8A8' },
    ],
    reactions: ['❤️', '👏', '🔥', '✨', '🎨'],
    likes: 234,
    comments: 45,
    time: '2h ago',
  },
  {
    id: 2,
    user: { name: 'Marc Dubois', avatar: 'MD', location: 'Lyon, France' },
    content: 'Just finished a beautiful morning run along the Saône. There\'s something magical about watching the city wake up. Starting the week with positive energy! 🌅',
    images: [{ type: 'morning', color: '#FFE5CC' }],
    reactions: ['❤️', '💪', '🌟'],
    likes: 156,
    comments: 28,
    time: '4h ago',
  },
  {
    id: 3,
    user: { name: 'Amélie Chen', avatar: 'AC', location: 'Bordeaux, France' },
    content: 'New collection preview 🎨 Spent months perfecting these pieces. Each one tells a different story. Can\'t wait to share the full reveal next week!',
    images: [
      { type: 'art1', color: '#B4D4E1' },
      { type: 'art2', color: '#E1D4B4' },
    ],
    reactions: ['😍', '🎨', '✨', '👀'],
    likes: 512,
    comments: 89,
    time: '6h ago',
  },
];

const stories = [
  { name: 'Léa', avatar: 'LM', color: '#FFB4D4' },
  { name: 'Thomas', avatar: 'TL', color: '#B4D4FF' },
  { name: 'Julia', avatar: 'JR', color: '#FFE5B4' },
  { name: 'Pierre', avatar: 'PB', color: '#D4FFB4' },
  { name: 'Emma', avatar: 'EG', color: '#E5B4FF' },
];

const events = [
  {
    id: 1,
    title: 'Fashion Week Paris 2026',
    organizer: 'Fédération de la Haute Couture',
    date: '25 février 2026',
    time: '19:00',
    location: 'Grand Palais, Paris',
    description: 'La semaine de la mode parisienne présente les nouvelles collections printemps-été des plus grands créateurs.',
    image: { type: 'fashion week', color: '#1A1A1A' },
    attendees: 2847,
    category: 'Défilé',
    verified: true,
  },
  {
    id: 2,
    title: 'Casting Day - Agences Parisiennes',
    organizer: 'Elite & IMG Models',
    date: '12 février 2026',
    time: '10:00 - 18:00',
    location: 'Le Marais, Paris',
    description: 'Journée portes ouvertes avec les plus grandes agences parisiennes. Venez avec votre book !',
    image: { type: 'casting', color: '#3B82F6' },
    attendees: 523,
    category: 'Casting',
    verified: true,
  },
  {
    id: 3,
    title: 'Workshop Photo de Mode',
    organizer: 'Studio Lumière Pro',
    date: '8 février 2026',
    time: '14:00 - 17:00',
    location: 'Lyon 2ème',
    description: 'Atelier pratique avec photographes professionnels. Apprenez les techniques de pose et d\'expression.',
    image: { type: 'workshop', color: '#8B5CF6' },
    attendees: 45,
    category: 'Workshop',
    verified: false,
  },
  {
    id: 4,
    title: 'Soirée Networking Mode & Luxe',
    organizer: 'Fashion Connect',
    date: '15 février 2026',
    time: '20:00',
    location: 'Hôtel Plaza Athénée, Paris',
    description: 'Rencontrez créateurs, mannequins, photographes et agents dans une ambiance exclusive.',
    image: { type: 'networking', color: '#EC4899' },
    attendees: 156,
    category: 'Networking',
    verified: true,
  },
  {
    id: 5,
    title: 'Défilé Haute Couture Chanel',
    organizer: 'Chanel',
    date: '27 février 2026',
    time: '15:00',
    location: 'Grand Palais Éphémère, Paris',
    description: 'Présentation exclusive de la collection Haute Couture Printemps-Été 2026.',
    image: { type: 'haute couture', color: '#000000' },
    attendees: 892,
    category: 'Défilé',
    verified: true,
  },
  {
    id: 6,
    title: 'Salon du Mannequinat',
    organizer: 'Fashion Industry Events',
    date: '20 février 2026',
    time: '11:00 - 19:00',
    location: 'Porte de Versailles, Paris',
    description: 'Salon professionnel réunissant agences, écoles, photographes et marques. Conférences et masterclass.',
    image: { type: 'salon', color: '#F59E0B' },
    attendees: 1245,
    category: 'Salon',
    verified: true,
  },
];

const suggestions = [
  { name: 'Claire Martin', avatar: 'CM', followers: '2.4k', color: '#FFD4E5' },
  { name: 'Lucas Petit', avatar: 'LP', followers: '1.8k', color: '#D4E5FF' },
  { name: 'Nina Rousseau', avatar: 'NR', followers: '3.1k', color: '#FFE5D4' },
];

const menuItems = [
  { name: 'Newsfeed', icon: '📱' },
  { name: 'Événements', icon: '🎉' },
  { name: 'Messages', icon: '✉️' },
  { name: 'Collaboration', icon: '🤝' },
  { name: 'Portfolio', icon: '🎨' },
  { name: 'Progression', icon: '📊' },
  { name: 'Settings', icon: '⚙️' },
];

const levels = [
  {
    level: 1,
    name: 'Découverte',
    icon: '🌟',
    xpRequired: 0,
    color: '#C8956B',
    benefits: ['Accès au feed', 'Création de profil', 'Messages privés'],
  },
  {
    level: 2,
    name: 'Explorateur',
    icon: '🧭',
    xpRequired: 200,
    color: '#8B5CF6',
    benefits: ['Accès aux événements', 'Sauvegarde des posts', 'Mode nuit'],
  },
  {
    level: 3,
    name: 'Ambassadeur',
    icon: '🏆',
    xpRequired: 450,
    color: '#3B82F6',
    benefits: ['Collaboration prioritaire', 'Accès portfolio avancé', 'Badges exclusifs'],
  },
  {
    level: 4,
    name: 'Élite',
    icon: '💎',
    xpRequired: 750,
    color: '#10B981',
    benefits: ['Mentorat', 'Analytique avancée', 'Événements VIP'],
  },
  {
    level: 5,
    name: 'Icône',
    icon: '👑',
    xpRequired: 1100,
    color: '#F59E0B',
    benefits: ['Mise en avant', 'Collab premium', 'Support dédié'],
  },
];

const xpActions = [
  { icon: '📝', action: 'Publier un post', xp: 30 },
  { icon: '🤝', action: 'Participer à un casting', xp: 50 },
  { icon: '📸', action: 'Ajouter des médias', xp: 20 },
  { icon: '💬', action: 'Interagir avec la communauté', xp: 15 },
];

export default function PremiumWorkspaceTab() {
  const [currentView, setCurrentView] = useState('Newsfeed');
  const [likedPosts, setLikedPosts] = useState({});

  const userLevel = 4;
  const userXP = 780;
  const maxLevel = levels.length;
  const xpToNextLevel = useMemo(() => levels[Math.min(userLevel, maxLevel - 1)]?.xpRequired || 0, [userLevel]);
  const xpProgress = useMemo(() => {
    if (userLevel >= maxLevel) return 100;
    const currentLevelXP = levels[userLevel - 1].xpRequired;
    const nextLevelXP = levels[userLevel].xpRequired;
    const progress = ((userXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
  }, [userLevel, userXP]);

  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const renderEventsView = () => (
    <div>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
      }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '28px',
          fontWeight: '700',
          color: '#1A1A1A'
        }}>Événements à venir</h1>
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '15px',
          color: '#6B7280'
        }}>Découvre les prochaines dates incontournables de la mode.</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['Toutes', 'Défilé', 'Casting', 'Workshop', 'Networking', 'Salon'].map((filter, i) => (
            <button
              key={filter}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                background: i === 0 ? 'linear-gradient(135deg, #C8956B 0%, #B8805A 100%)' : '#F3F4F6',
                color: i === 0 ? 'white' : '#6B7280',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      {events.map((event) => {
        const categoryColor = getCategoryColor(event.category);
        return (
          <div
            key={event.id}
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '24px',
              marginBottom: '20px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
            }}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '18px',
                background: event.image.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '12px'
              }}>
                {event.image.type}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1A1A1A' }}>{event.title}</h3>
                  {event.verified && (
                    <span style={{
                      background: '#3B82F6',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px'
                    }}>✓</span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{event.organizer}</div>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#374151' }}>{event.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#6B7280' }}>
                  <span>📅 {event.date}</span>
                  <span>⏰ {event.time}</span>
                  <span>📍 {event.location}</span>
                </div>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #F3F4F6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6B7280' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10B981'
                }}></div>
                <strong style={{ color: '#1A1A1A' }}>{event.attendees}</strong> participants
              </div>
              <button style={{
                background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}DD 100%)`,
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: `0 4px 12px ${categoryColor}30`
              }}>
                Participer
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderPortfolioView = () => (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      padding: '32px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
    }}>
      <h1 style={{
        margin: '0 0 8px 0',
        fontSize: '28px',
        fontWeight: '700',
        color: '#1A1A1A'
      }}>Portfolio Premium</h1>
      <p style={{
        margin: '0 0 24px 0',
        fontSize: '15px',
        color: '#6B7280'
      }}>Sélection d\'images pour mettre en valeur ton univers.</p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        {['Editorial', 'Studio', 'Runway', 'Beauty', 'Campaign', 'Lifestyle'].map((label, i) => (
          <div key={label} style={{
            background: ['#E8DED2', '#D4C5B9', '#B4D4E1', '#FFE5CC', '#C9B8A8', '#E1D4B4'][i % 6],
            borderRadius: '16px',
            paddingBottom: '120%',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '700',
              color: '#1A1A1A',
              opacity: 0.5
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCollaborationView = () => (
    <div>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
      }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '28px',
          fontWeight: '700',
          color: '#1A1A1A'
        }}>Opportunités de Collaboration</h1>
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '15px',
          color: '#6B7280'
        }}>Découvre les offres de collaboration des plus grandes marques et professionnels de la mode</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['Toutes', 'Rémunéré', 'TFP', 'Marques', 'Photographes', 'Agences'].map((filter, i) => (
            <button
              key={filter}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                background: i === 0 ? 'linear-gradient(135deg, #C8956B 0%, #B8805A 100%)' : '#F3F4F6',
                color: i === 0 ? 'white' : '#6B7280',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      {collaborationPosts.map((collab) => {
        const typeInfo = getCompanyTypeLabel(collab.type);
        return (
          <div key={collab.id} style={{
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${typeInfo.color} 0%, ${typeInfo.color}DD 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'white',
                  boxShadow: `0 4px 12px ${typeInfo.color}30`
                }}>
                  {collab.company.logo}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1A1A1A' }}>{collab.company.name}</h3>
                    {collab.company.verified && (
                      <div style={{
                        background: '#3B82F6',
                        color: 'white',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px'
                      }}>✓</div>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{typeInfo.icon} {typeInfo.label}</span>
                    <span>•</span>
                    <Clock size={12} />
                    {collab.time}
                  </div>
                </div>
              </div>
              <button style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'background 0.2s'
              }}>
                <MoreHorizontal size={20} color="#9CA3AF" />
              </button>
            </div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: '700', color: '#1A1A1A', lineHeight: '1.4' }}>{collab.title}</h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '15px', lineHeight: '1.5', color: '#6B7280' }}>{collab.description}</p>
            {collab.images && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: collab.images.length === 3 ? '1fr 1fr 1fr' : collab.images.length === 2 ? '1fr 1fr' : '1fr',
                gap: '8px',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '16px'
              }}>
                {collab.images.map((img, i) => (
                  <div key={i} style={{
                    background: img.color,
                    paddingBottom: collab.images.length === 1 ? '60%' : '100%',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#FFFFFF',
                      opacity: 0.4,
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      {img.type}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {collab.requirements && (
              <div style={{
                background: '#F9FAFB',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h4 style={{
                  margin: '0 0 10px 0',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#1A1A1A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>📋 Critères recherchés</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                  {collab.requirements.map((req, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#374151' }}>
                      <div style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: typeInfo.color,
                        marginTop: '6px',
                        flexShrink: 0
                      }}></div>
                      {req}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid #F3F4F6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#6B7280' }}>
                <div style={{
                  background: collab.compensation === 'Rémunéré' ? '#10B98115' : collab.compensation === 'TFP' ? '#F59E0B15' : '#E5E7EB',
                  color: collab.compensation === 'Rémunéré' ? '#10B981' : collab.compensation === 'TFP' ? '#F59E0B' : '#6B7280',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  {collab.compensation === 'Rémunéré' ? '💰 Rémunéré' : collab.compensation === 'TFP' ? '🤝 TFP' : '📋 Casting'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} />
                  {collab.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <strong style={{ color: '#1A1A1A' }}>{collab.applicants}</strong> candidatures
                </div>
              </div>
              <button style={{
                background: 'linear-gradient(135deg, #C8956B 0%, #B8805A 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(200, 149, 107, 0.3)'
              }}>
                Postuler
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderProgressionView = () => (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      padding: '32px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: '#1A1A1A' }}>Ta Progression</h1>
        <p style={{ margin: 0, fontSize: '15px', color: '#6B7280' }}>Continue d'interagir pour débloquer de nouveaux niveaux et avantages exclusifs !</p>
      </div>
      <div style={{
        background: `linear-gradient(135deg, ${levels[userLevel - 1].color}15 0%, ${levels[userLevel - 1].color}25 100%)`,
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        border: `2px solid ${levels[userLevel - 1].color}40`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: `linear-gradient(135deg, ${levels[userLevel - 1].color} 0%, ${levels[userLevel - 1].color}DD 100%)`,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              boxShadow: `0 8px 24px ${levels[userLevel - 1].color}40`
            }}>
              {levels[userLevel - 1].icon}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: levels[userLevel - 1].color, marginBottom: '4px' }}>NIVEAU {userLevel}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1A1A1A', marginBottom: '4px' }}>{levels[userLevel - 1].name}</div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>{userXP} / {xpToNextLevel} XP</div>
            </div>
          </div>
          <Award size={48} color={levels[userLevel - 1].color} />
        </div>
        {userLevel < maxLevel && (
          <div>
            <div style={{
              width: '100%',
              height: '16px',
              background: 'white',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '12px'
            }}>
              <div style={{
                width: `${xpProgress}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${levels[userLevel - 1].color} 0%, ${levels[userLevel].color} 100%)`,
                borderRadius: '20px',
                transition: 'width 0.5s ease-out',
                boxShadow: `0 0 16px ${levels[userLevel - 1].color}60`,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                  animation: 'shimmer 2s infinite'
                }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
              <span style={{ color: levels[userLevel - 1].color }}>{Math.round(xpProgress)}% complété</span>
              <span style={{ color: '#6B7280' }}>{xpToNextLevel - userXP} XP pour {levels[userLevel].name}</span>
            </div>
          </div>
        )}
        {userLevel === maxLevel && (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            borderRadius: '16px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#92400E', marginBottom: '4px' }}>Félicitations !</div>
            <div style={{ fontSize: '14px', color: '#92400E' }}>Vous avez atteint le niveau maximum et débloqué tous les avantages !</div>
          </div>
        )}
        <div style={{ marginTop: '24px', padding: '20px', background: 'white', borderRadius: '16px' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '700',
            color: '#1A1A1A',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Zap size={16} color={levels[userLevel - 1].color} />
            Avantages débloqués
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {levels[userLevel - 1].benefits.map((benefit, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: levels[userLevel - 1].color }}></div>
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700', color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} />
          Tous les niveaux
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {levels.map((level) => {
            const isUnlocked = userLevel >= level.level;
            const isCurrent = userLevel === level.level;
            return (
              <div key={level.level} style={{
                background: isCurrent ? `linear-gradient(135deg, ${level.color}10 0%, ${level.color}20 100%)` : isUnlocked ? '#F9FAFB' : '#FAFAFA',
                border: isCurrent ? `2px solid ${level.color}` : '2px solid transparent',
                borderRadius: '16px',
                padding: '20px',
                opacity: isUnlocked ? 1 : 0.6,
                position: 'relative',
                overflow: 'hidden'
              }}>
                {isCurrent && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: level.color,
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '4px 12px',
                    borderRadius: '12px'
                  }}>ACTUEL</div>
                )}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: isUnlocked ? `linear-gradient(135deg, ${level.color} 0%, ${level.color}DD 100%)` : '#E5E7EB',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    flexShrink: 0,
                    boxShadow: isUnlocked ? `0 4px 12px ${level.color}30` : 'none'
                  }}>
                    {isUnlocked ? level.icon : '🔒'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: isUnlocked ? level.color : '#9CA3AF' }}>NIVEAU {level.level}</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: isUnlocked ? '#1A1A1A' : '#9CA3AF' }}>{level.name}</div>
                    </div>
                    {level.level > 1 && (
                      <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                        {isUnlocked ? '✓ Débloqué' : `Requiert ${level.xpRequired} XP total`}
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginTop: '12px' }}>
                      {level.benefits.map((benefit, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: isUnlocked ? '#374151' : '#9CA3AF' }}>
                          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: isUnlocked ? level.color : '#D1D5DB' }}></div>
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700', color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={20} />
          Gagne de l'XP
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
          {xpActions.map((action, i) => (
            <div key={i} style={{
              background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>{action.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{action.action}</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                color: 'white',
                fontSize: '13px',
                fontWeight: '700',
                padding: '6px 12px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
              }}>+{action.xp} XP</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
      fontFamily: '"Outfit", -apple-system, BlinkMacSystemFont, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '280px 1fr 320px',
        gap: '24px'
      }}>
        <div style={{ position: 'sticky', top: '20px', height: 'fit-content' }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            marginBottom: '20px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #C8956B 0%, #B8805A 100%)',
                borderRadius: '50%',
                margin: '0 auto 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: '700',
                color: 'white',
                boxShadow: '0 8px 16px rgba(200, 149, 107, 0.3)'
              }}>BM</div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#1A1A1A' }}>Bogdan Molin</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>@bogdan.molin</p>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              padding: '16px 0',
              borderTop: '1px solid #F3F4F6',
              borderBottom: '1px solid #F3F4F6',
              marginBottom: '20px'
            }}>
              {[
                { label: 'Posts', value: '523' },
                { label: 'Followers', value: '2.4k' },
                { label: 'Following', value: '892' },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A' }}>{item.value}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: `linear-gradient(135deg, ${levels[userLevel - 1].color} 0%, ${levels[userLevel - 1].color}DD 100%)`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    boxShadow: `0 4px 12px ${levels[userLevel - 1].color}40`
                  }}>
                    {levels[userLevel - 1].icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1A1A1A' }}>
                      {userLevel === maxLevel ? `${levels[userLevel - 1].icon} Niveau MAX` : `Niveau ${userLevel}`}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>{levels[userLevel - 1].name}</div>
                  </div>
                </div>
                {userLevel < maxLevel && (
                  <div style={{ fontSize: '12px', fontWeight: '600', color: levels[userLevel - 1].color }}>{userXP}/{xpToNextLevel} XP</div>
                )}
              </div>
              {userLevel < maxLevel ? (
                <>
                  <div style={{
                    width: '100%',
                    height: '12px',
                    background: 'white',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                  }}>
                    <div style={{
                      width: `${xpProgress}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${levels[userLevel - 1].color} 0%, ${levels[userLevel].color} 100%)`,
                      borderRadius: '20px',
                      transition: 'width 0.5s ease-out',
                      boxShadow: `0 0 12px ${levels[userLevel - 1].color}60`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        animation: 'shimmer 2s infinite'
                      }}></div>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '8px', textAlign: 'center' }}>
                    🎯 {xpToNextLevel - userXP} XP pour {levels[userLevel].name}
                  </div>
                </>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#92400E'
                }}>
                  ✨ Félicitations ! Vous avez atteint le niveau maximum !
                </div>
              )}
            </div>
            {menuItems.map((item) => (
              <div
                key={item.name}
                onClick={() => setCurrentView(item.name)}
                style={{
                  padding: '12px 16px',
                  margin: '4px 0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: currentView === item.name ? '600' : '500',
                  color: currentView === item.name ? 'white' : '#4B5563',
                  background: currentView === item.name ? 'linear-gradient(135deg, #C8956B 0%, #B8805A 100%)' : 'transparent',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{item.icon}</span>
                {item.name}
              </div>
            ))}
          </div>
        </div>
        <div>
          {currentView === 'Progression' ? (
            renderProgressionView()
          ) : currentView === 'Collaboration' ? (
            renderCollaborationView()
          ) : currentView === 'Événements' ? (
            renderEventsView()
          ) : currentView === 'Portfolio' ? (
            renderPortfolioView()
          ) : (
            <>
              <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1A1A1A' }}>Stories</h3>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {stories.map((story) => (
                    <div key={story.name} style={{ textAlign: 'center', cursor: 'pointer', minWidth: '70px' }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${story.color} 0%, ${story.color}CC 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: '700',
                        color: 'white',
                        marginBottom: '8px',
                        border: '3px solid white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        {story.avatar}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>{story.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              {posts.map((post) => (
                <div key={post.id} style={{
                  background: 'white',
                  borderRadius: '24px',
                  padding: '24px',
                  marginBottom: '20px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #C8956B 0%, #B8805A 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: 'white'
                      }}>
                        {post.user.avatar}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1A1A1A', marginBottom: '2px' }}>{post.user.name}</div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={12} />
                          {post.user.location}
                          <span style={{ margin: '0 4px' }}>•</span>
                          <Clock size={12} />
                          {post.time}
                        </div>
                      </div>
                    </div>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px'
                    }}>
                      <MoreHorizontal size={20} color="#9CA3AF" />
                    </button>
                  </div>
                  <p style={{ margin: '0 0 16px 0', fontSize: '15px', lineHeight: '1.6', color: '#374151' }}>{post.content}</p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: post.images.length === 3 ? '1fr 1fr 1fr' : post.images.length === 2 ? '1fr 1fr' : '1fr',
                    gap: '8px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    marginBottom: '16px'
                  }}>
                    {post.images.map((img, i) => (
                      <div key={`${post.id}-${img.type}-${i}`} style={{
                        background: img.color,
                        paddingBottom: post.images.length === 1 ? '60%' : '100%',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#1A1A1A',
                          opacity: 0.3
                        }}>
                          {img.type}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '4px',
                    marginBottom: '12px',
                    padding: '8px',
                    background: '#F9FAFB',
                    borderRadius: '12px',
                    width: 'fit-content'
                  }}>
                    {post.reactions.map((reaction) => (
                      <span key={`${post.id}-${reaction}`} style={{ fontSize: '18px', cursor: 'pointer' }}>{reaction}</span>
                    ))}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid #F3F4F6'
                  }}>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <button
                        onClick={() => toggleLike(post.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: likedPosts[post.id] ? '#EF4444' : '#6B7280',
                          padding: '8px 12px',
                          borderRadius: '8px'
                        }}
                      >
                        <Heart size={18} color={likedPosts[post.id] ? '#EF4444' : '#6B7280'} />
                        {post.likes + (likedPosts[post.id] ? 1 : 0)}
                      </button>
                      <button style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#6B7280',
                        padding: '8px 12px',
                        borderRadius: '8px'
                      }}>
                        <MessageCircle size={18} />
                        {post.comments}
                      </button>
                      <button style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#6B7280',
                        padding: '8px 12px',
                        borderRadius: '8px'
                      }}>
                        <Send size={18} />
                        Share
                      </button>
                    </div>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px'
                    }}>
                      <Bookmark size={18} color="#9CA3AF" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        <div style={{ position: 'sticky', top: '20px', height: 'fit-content' }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1A1A1A' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button style={{
                background: 'linear-gradient(135deg, #C8956B 0%, #B8805A 100%)',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(200, 149, 107, 0.3)'
              }}>Create Post</button>
              <button style={{
                background: '#F3F4F6',
                color: '#374151',
                border: 'none',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>Upload Media</button>
            </div>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1A1A1A' }}>Suggestions</h3>
            {suggestions.map((user) => (
              <div key={user.name} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: user.name !== suggestions[suggestions.length - 1].name ? '1px solid #F3F4F6' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${user.color} 0%, ${user.color}CC 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: 'white'
                  }}>
                    {user.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{user.followers} followers</div>
                  </div>
                </div>
                <button style={{
                  background: 'linear-gradient(135deg, #C8956B 0%, #B8805A 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>Follow</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 200%; }
}
* {
  scrollbar-width: thin;
  scrollbar-color: #CBD5E1 #F1F5F9;
}
*::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
*::-webkit-scrollbar-track {
  background: #F1F5F9;
  border-radius: 10px;
}
*::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 10px;
}
*::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}
`}</style>
    </div>
  );
}

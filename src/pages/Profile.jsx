import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../components/ui';
import AnimeList from '../components/AnimeList';
import '../styles/Profile.css';

const Profile = ({ 
  data, userInfo, onUpdateUser,
  toggleFavorite, toggleWatching, toggleWatched, togglePlanned, onDeleteAnime, onUpdateRating,
  mostCommentedAnime = [] 
}) => {
  const [activeTab, setActiveTab] = useState('favorite');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: userInfo.name || "",
    email: userInfo.email || ""
  });

  const favoriteItems = data.filter(a => a.is_favorite);
  const watchingItems = data.filter(a => a.is_watching);
  const watchedItems = data.filter(a => a.in_watchlist);
  const plannedItems = data.filter(a => a.planned);

  // Розрахунок статистики
  const uniqueInteracted = data.filter(a => a.is_favorite || a.is_watching || a.in_watchlist || a.planned);
  const totalAnime = uniqueInteracted.length;
  
  const ratedAnime = data.filter(a => a.user_rating && parseFloat(a.user_rating) > 0);
  const avgRating = ratedAnime.length > 0 
    ? (ratedAnime.reduce((sum, a) => sum + parseFloat(a.user_rating), 0) / ratedAnime.length).toFixed(1)
    : '0.0';

  const episodesWatched = watchedItems.reduce((sum, a) => sum + (parseInt(a.episodesCount || a.episodes) || 0), 0) + 
                          watchingItems.reduce((sum, a) => sum + (parseInt(a.episodesCount || a.episodes) / 2 || 0), 0);

  const genreCounts = {};
  uniqueInteracted.forEach(anime => {
    if (anime.genres) {
      let genresArray = [];
      if (Array.isArray(anime.genres)) {
        genresArray = anime.genres;
      } else if (typeof anime.genres === 'string' && anime.genres !== 'Невідомо') {
        genresArray = anime.genres.split(',').map(g => g.trim());
      }
      
      genresArray.forEach(g => {
        if (g && g !== 'Невідомо') {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        }
      });
    }
  });
  
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Допоміжна функція для правильного відмінювання слова "коментар"
  const getCommentsString = (count) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return `${count} коментарів`;
    if (lastDigit === 1) return `${count} коментар`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${count} коментарі`;
    return `${count} коментарів`;
  };

  const handleSaveProfile = () => {
    if (onUpdateUser) {
      onUpdateUser({
        name: editForm.name,
        email: editForm.email
      });
    }
    setIsEditing(false);
  };

  const renderActiveList = () => {
    let listToRender = [];
    if (activeTab === 'favorite') listToRender = favoriteItems;
    if (activeTab === 'watched') listToRender = watchedItems;
    if (activeTab === 'watching') listToRender = watchingItems;
    if (activeTab === 'planned') listToRender = plannedItems;

    if (listToRender.length === 0) {
      return <div className="empty-message" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Список порожній</div>;
    }

    const displayedItems = listToRender.slice(0, 9);
    const hasMore = listToRender.length > 9;

    return (
      <div className="profile-anime-container">
        <AnimeList 
          list={displayedItems} 
          onToggleFavorite={toggleFavorite} 
          onToggleWatching={toggleWatching} 
          onToggleWatched={toggleWatched} 
          onTogglePlanned={togglePlanned} 
          onDeleteAnime={onDeleteAnime} 
          onUpdateRating={onUpdateRating} 
        />
        
        {hasMore && (
          <div className="view-more-wrapper">
            <Link to={`/${activeTab}`} className="view-more-link">
              Переглянути всі {listToRender.length} аніме
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="profile-page-wrapper">
      
      {/* 1. ШАПКА ПРОФІЛЮ З МОЖЛИВІСТЮ РЕДАГУВАННЯ */}
      <div className="profile-header-card">
        <div className="profile-avatar-large">
          {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
        </div>
        
        <div className="profile-info">
          {isEditing ? (
            <div className="edit-form-container">
              <input 
                type="text" 
                className="edit-input" 
                value={editForm.name} 
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                placeholder="Ваше ім'я"
              />
              <input 
                type="email" 
                className="edit-input" 
                value={editForm.email} 
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                placeholder="Ваш Email"
              />
              <div className="edit-actions">
                <Button variant="primary" onClick={handleSaveProfile}>Зберегти</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Скасувати</Button>
              </div>
            </div>
          ) : (
            <>
              <h1>{userInfo.name}</h1>
              <p>{userInfo.email}</p>
              <div className="profile-meta">
                <span>📅 Учасник з {userInfo.joinedDate}</span>
                <span>💬 {userInfo.commentsCount} коментарів</span>
              </div>
              <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                ✎ Редагувати
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. ЗВЕДЕНА СТАТИСТИКА БІБЛІОТЕКИ */}
      <div className="profile-stats-grid">
        <div className="profile-stat-box">
          <div className="profile-stat-icon" style={{ color: '#ef4444' }}>❤️</div>
          <div className="profile-stat-number">{favoriteItems.length}</div>
          <div className="profile-stat-label">Улюблених</div>
        </div>
        <div className="profile-stat-box">
          <div className="profile-stat-icon" style={{ color: '#10b981' }}>✅</div>
          <div className="profile-stat-number">{watchedItems.length}</div>
          <div className="profile-stat-label">Переглянуто</div>
        </div>
        <div className="profile-stat-box">
          <div className="profile-stat-icon" style={{ color: '#3b82f6' }}>▶️</div>
          <div className="profile-stat-number">{watchingItems.length}</div>
          <div className="profile-stat-label">Дивлюся</div>
        </div>
        <div className="profile-stat-box">
          <div className="profile-stat-icon" style={{ color: '#f59e0b' }}>📅</div>
          <div className="profile-stat-number">{plannedItems.length}</div>
          <div className="profile-stat-label">В планах</div>
        </div>
      </div>

      <div className="profile-main-layout">
        
        {/* 3. ПЕРСОНАЛЬНА БІБЛІОТЕКА (Вкладки та Сітка) */}
        <div>
          <div className="profile-tabs">
            {['favorite', 'watched', 'watching', 'planned'].map(tab => (
              <button 
                key={tab}
                className={`profile-tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'favorite' ? 'Улюблені' : 
                 tab === 'watched' ? 'Переглянуто' : 
                 tab === 'watching' ? 'Дивлюся' : 'В планах'}
              </button>
            ))}
          </div>

          <Card style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>
              {activeTab === 'favorite' ? `Улюблені аніме` : 
               activeTab === 'watched' ? `Переглянуто` : 
               activeTab === 'watching' ? `Зараз дивлюся` : 
               `В планах`}
            </h3>
            {renderActiveList()}
          </Card>
        </div>

        {/* 4. БІЧНА ПАНЕЛЬ АНАЛІТИКИ */}
        <div className="analytics-sidebar">
          
          <div className="analytics-card">
            <h3><span>🏆</span> Статистика</h3>
            <div className="analytics-row">
              <span className="analytics-label">Всього аніме:</span> 
              <strong>{totalAnime}</strong>
            </div>
            <div className="analytics-row">
              <span className="analytics-label">Середній рейтинг:</span> 
              <strong>{avgRating}/10</strong>
            </div>
            <div className="analytics-row">
              <span className="analytics-label">Епізодів переглянуто:</span> 
              <strong>{Math.floor(episodesWatched)}</strong>
            </div>
            <div className="analytics-row" style={{ marginBottom: 0 }}>
              <span className="analytics-label">Коментарів:</span> 
              <strong>{userInfo.commentsCount}</strong>
            </div>
          </div>

          <div className="analytics-card">
            <h3>Улюблені жанри</h3>
            {topGenres.length > 0 ? topGenres.map(([genre, count]) => (
              <div key={genre} className="analytics-row">
                <span className="genre-tag-profile">{genre}</span>
                <span className="analytics-label">{count}</span>
              </div>
            )) : <p className="analytics-label">Недостатньо даних</p>}
          </div>

          {/* ДИНАМІЧНИЙ БЛОК: НАЙБІЛЬШ КОМЕНТОВАНІ */}
          <div className="analytics-card">
            <h3><span>💬</span> Найбільш коментовані</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {mostCommentedAnime && mostCommentedAnime.length > 0 ? (
                mostCommentedAnime.map((anime) => (
                  <div key={anime.anihubId || anime.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img 
                      src={anime.poster || 'https://via.placeholder.com/45x65'} 
                      alt={anime.titleUkrainian || anime.title} 
                      style={{ borderRadius: '6px', width: '45px', height: '65px', objectFit: 'cover', background: '#222' }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <Link 
                        to={`/anime/${anime.anihubId || anime.id}`} 
                        style={{ 
                          fontSize: '14px', 
                          fontWeight: 'bold', 
                          color: 'var(--text-primary)', 
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        className="commented-anime-link"
                      >
                        {anime.titleUkrainian || anime.title || 'Без назви'}
                      </Link>
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                        {getCommentsString(anime.commentsCount || 0)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="analytics-label" style={{ color: 'var(--text-muted)', margin: 0 }}>Ви ще не залишали коментарів</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
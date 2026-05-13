import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Input } from './ui';

const AnimeCard = ({ 
  id, anihubId, titleUkrainian, title, poster_url, poster, rating, userRating, year, episodesCount, 
  genres, isFavorite, isWatching, isWatched, planned, 
  onToggleFavorite, onToggleWatching, onToggleWatched, onTogglePlanned, 
  isAddedByUser, onDeleteAnime, onUpdateRating 
}) => {
  
  // Уніфікація даних
  const actualAnihubId = anihubId || id;
  const actualTitle = titleUkrainian || title || 'Без назви';
  const actualPoster = poster_url || poster;
  
  const displayUserRating = userRating ? parseFloat(userRating).toFixed(1) : '0.0';
  
  const displayGenres = Array.isArray(genres) ? genres.join(', ') : (genres || "Невідомо");

  // Локальний стан для миттєвого відгуку інтерфейсу
  const [optFavorite, setOptFavorite] = useState(isFavorite);
  const [optWatching, setOptWatching] = useState(isWatching);
  const [optWatched, setOptWatched] = useState(isWatched);
  const [optPlanned, setOptPlanned] = useState(planned);
  const [optRating, setOptRating] = useState(displayUserRating);
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempRating, setTempRating] = useState(displayUserRating);

  // Синхронізація з пропсами (коли дані оновлюються в App.jsx)
  useEffect(() => {
    setOptFavorite(isFavorite);
    setOptWatching(isWatching);
    setOptWatched(isWatched);
    setOptPlanned(planned);
    setOptRating(displayUserRating);
    setTempRating(displayUserRating);
  }, [isFavorite, isWatching, isWatched, planned, userRating]);

  // Формування об'єкту для передачі в App.jsx
  const getAnimeData = () => ({
    id, // Внутрішній ID бази (якщо є)
    anihubId: actualAnihubId, 
    titleUkrainian: actualTitle, 
    poster: actualPoster, 
    rating, 
    year, 
    episodesCount, 
    genres
  });

  const handleToggleFav = (e) => {
    e.preventDefault(); e.stopPropagation();
    onToggleFavorite(getAnimeData());
  };

  const handleToggleWatching = (e) => {
    e.preventDefault(); e.stopPropagation();
    onToggleWatching(getAnimeData());
  };

  const handleToggleWatched = (e) => {
    e.preventDefault(); e.stopPropagation();
    onToggleWatched(getAnimeData());
  };

  const handleTogglePlanned = (e) => {
    e.preventDefault(); e.stopPropagation();
    onTogglePlanned(getAnimeData());
  };

  const handleSaveRating = (e) => {
    e.stopPropagation();
    const numRating = parseFloat(tempRating);
    if (isNaN(numRating) || numRating < 0 || numRating > 10) return;
    onUpdateRating(getAnimeData(), numRating.toFixed(1)); 
    setIsEditing(false);
  };

  return (
    <Card className={`anime-card-modern compact ${optWatched ? 'watched' : ''}`}>
      <div className="poster-container">
        <Link to={`/anime/${actualAnihubId}`} className="poster-link">
          <img src={actualPoster} alt={actualTitle} className="poster-image" loading="lazy" />
          <div className="poster-overlay"><span className="play-icon">▶</span></div>
        </Link>
        
        {rating && parseFloat(rating) > 0 && (
          <span className="global-rating">★ {parseFloat(rating).toFixed(1)}</span>
        )}
      
        <button 
          className={`action-icon-btn favorite ${optFavorite ? 'active' : ''}`}
          onClick={handleToggleFav}
          title="В улюблене"
        >
          {optFavorite ? '❤️' : '🤍'}
        </button>

        {isAddedByUser && (
          <button className="action-icon-btn delete" onClick={(e) => {
            e.preventDefault(); e.stopPropagation(); onDeleteAnime(id);
          }} title="Видалити">🗑️</button>
        )}
      </div>

      <div className="card-info compact-info">
        <Link to={`/anime/${actualAnihubId}`} className="title-link">
          <h3 className="anime-title" title={actualTitle}>{actualTitle}</h3>
        </Link>
        
        <div className="meta-tags">
          {year && <span className="meta-tag">{year}</span>}
          {episodesCount > 0 && <span className="meta-tag">{episodesCount} сер.</span>}
        </div>

        <span className="genre-text compact-genre">{displayGenres}</span>

        <div className="card-actions compact-actions">
          {!optWatching && !optWatched && (
            <Button variant="outline" onClick={handleToggleWatching} className="full-width-btn" style={{ marginBottom: '8px' }}>
              👁️ Буду дивитися
            </Button>
          )}

          {optWatching && !optWatched && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <div className="status-label-active">▶️ Дивлюся</div>
              <Button variant="outline" onClick={handleToggleWatched} style={{ flex: 1, padding: '8px 4px' }} title="Завершити?">
                🏁 Завершив?
              </Button>
            </div>
          )}

          {optWatched && (
            <Button variant="primary" onClick={handleToggleWatched} className="full-width-btn watched-btn" style={{ marginBottom: '8px', backgroundColor: '#10b981' }}>
              ✅ Переглянуто
            </Button>
          )}

          <Button 
            variant={optPlanned ? 'primary' : 'outline'} 
            onClick={handleTogglePlanned}
            className={`full-width-btn ${optPlanned ? 'planned-btn' : ''}`}
          >
            {optPlanned ? '📅 В планах' : '⏳ Додати в плани'}
          </Button>

          <div className="user-rating-box compact-rating">
            {isEditing ? (
              <div className="edit-rating-wrapper" onClick={e => e.stopPropagation()}>
                <Input type="number" step="0.1" min="0" max="10" value={tempRating} onChange={(e) => setTempRating(e.target.value)} className="rating-input" autoFocus />
                <Button variant="primary" className="save-btn small" onClick={handleSaveRating}>💾</Button>
              </div>
            ) : (
              <div className="display-rating-wrapper" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
                <span>Моя оцінка: </span>
                <strong className={`user-score ${parseFloat(optRating) > 0 ? 'rated' : ''}`}>{optRating}</strong>
                <span className="edit-hint">✎</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AnimeCard;